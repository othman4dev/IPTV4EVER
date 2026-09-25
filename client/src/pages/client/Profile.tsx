import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../services/authService";
import {
	deleteUser,
	getUser,
	updateUser,
	type User,
} from "../../services/userService";
import {
	getSubscriptionsByUser,
	updateSubscription,
	type Subscription,
} from "../../services/subscriptionService";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "../../assets/css/profile.css";

type ToastState = { message: string; type: "success" | "error" } | null;
type ProfileTab = "personal" | "subscriptions" | "security" | "account";

const PROFILE_TABS: Array<{
	id: ProfileTab;
	icon: string;
	label: string;
	helper: string;
}> = [
	{
		id: "personal",
		icon: "bi-person-fill",
		label: "Personal Info",
		helper: "Name, phone & contact",
	},
	{
		id: "subscriptions",
		icon: "bi-tv-fill",
		label: "Subscriptions",
		helper: "Plan & billing history",
	},
	{
		id: "security",
		icon: "bi-shield-lock-fill",
		label: "Security",
		helper: "Password & login",
	},
	{
		id: "account",
		icon: "bi-gear-fill",
		label: "Account",
		helper: "Privacy & deletion",
	},
];

const formatDate = (value: string | null) => {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const getErrorMessage = (error: unknown, fallback: string) => {
	if (error && typeof error === "object" && "message" in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === "string" && message.length > 0) return message;
	}
	return fallback;
};

const evaluatePasswordStrength = (password: string) => {
	if (!password) return { score: 0, label: "" };
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
	return { score, label: labels[Math.min(score, 5)] };
};

const Profile = () => {
	const navigate = useNavigate();
	const { user, login, logout } = useAuth();

	const [profile, setProfile] = useState<User | null>(null);
	const [subs, setSubs] = useState<Subscription[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingAccount, setSavingAccount] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);
	const [stoppingSub, setStoppingSub] = useState(false);
	const [deletingAccount, setDeletingAccount] = useState(false);
	const [activeTab, setActiveTab] = useState<ProfileTab>("personal");

	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [toast, setToast] = useState<ToastState>(null);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const showToast = (message: string, type: "success" | "error" = "success") => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		setToast({ message, type });
		toastTimerRef.current = setTimeout(() => setToast(null), 3200);
	};

	const load = useCallback(async () => {
		if (!user?.id) return;
		setLoading(true);
		try {
			const [me, history] = await Promise.all([
				getUser(user.id),
				getSubscriptionsByUser(user.id),
			]);
			setProfile(me);
			setSubs(history);
			setName(me.name ?? "");
			setPhone(me.phone ?? "");
		} catch (error: unknown) {
			showToast(getErrorMessage(error, "Failed to load profile"), "error");
		} finally {
			setLoading(false);
		}
	}, [user?.id]);

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}
		load();
	}, [user, navigate, load]);

	const currentSubscription = useMemo(() => {
		return (
			subs.find((s) => s.status === "ongoing") ||
			subs.find((s) => s.status === "pending") ||
			null
		);
	}, [subs]);

	const historySubscriptions = useMemo(() => {
		return [...subs].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	}, [subs]);

	const hasActiveSubscription = useMemo(
		() => subs.some((s) => s.status === "ongoing" || s.status === "pending"),
		[subs],
	);

	const profileInitials = useMemo(() => {
		const fullName = (profile?.name ?? user?.name ?? "").trim();
		if (!fullName) return "U";

		return (
			fullName
				.split(/\s+/)
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part.charAt(0).toUpperCase())
				.join("") || "U"
		);
	}, [profile?.name, user?.name]);

	const subscriptionProgress = useMemo(() => {
		if (!currentSubscription) return null;
		const start = new Date(currentSubscription.startDate).getTime();
		const end = new Date(currentSubscription.endDate).getTime();
		const now = Date.now();
		const totalMs = end - start;
		if (totalMs <= 0) return { percent: 100, daysLeft: 0, daysTotal: 0 };
		const elapsedMs = Math.max(0, Math.min(now - start, totalMs));
		const percent = Math.round((elapsedMs / totalMs) * 100);
		const daysLeft = Math.max(
			0,
			Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
		);
		const daysTotal = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
		return { percent, daysLeft, daysTotal };
	}, [currentSubscription]);

	const memberSince = formatDate(profile?.createdAt ?? user?.createdAt ?? null);
	const activePlanLabel = currentSubscription?.plan.name ?? "No active plan";
	const planColor = currentSubscription?.plan.color ?? "#ff3b3b";
	const passwordStrength = evaluatePasswordStrength(newPassword);

	const pageStyles = useMemo(
		() =>
			({
				"--plan-color": planColor,
			}) as CSSProperties,
		[planColor],
	);

	const handleSaveAccount = async () => {
		if (!profile) return;
		if (!name.trim()) {
			showToast("Name is required", "error");
			return;
		}
		setSavingAccount(true);
		try {
			const updated = await updateUser(profile.id, {
				name: name.trim(),
				phone: phone.trim() || undefined,
			});
			setProfile(updated);

			const updatedAuthUser = {
				...(user ?? {}),
				id: updated.id,
				email: updated.email,
				name: updated.name,
				phone: updated.phone ?? null,
				createdAt: updated.createdAt,
			};
			localStorage.setItem("user", JSON.stringify(updatedAuthUser));
			login(updatedAuthUser);

			showToast("Profile updated successfully", "success");
		} catch (error: unknown) {
			showToast(getErrorMessage(error, "Failed to update profile"), "error");
		} finally {
			setSavingAccount(false);
		}
	};

	const handleChangePassword = async () => {
		if (!profile) return;
		if (!oldPassword || !newPassword || !confirmPassword) {
			showToast("Please fill all password fields", "error");
			return;
		}
		if (newPassword.length < 8) {
			showToast("New password must be at least 8 characters", "error");
			return;
		}
		if (newPassword !== confirmPassword) {
			showToast("New password and confirmation do not match", "error");
			return;
		}

		setSavingPassword(true);
		try {
			await changePassword(profile.email, oldPassword, newPassword);
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			showToast("Password changed successfully", "success");
		} catch (error: unknown) {
			showToast(getErrorMessage(error, "Failed to change password"), "error");
		} finally {
			setSavingPassword(false);
		}
	};

	const handleStopSubscription = async () => {
		if (!currentSubscription) return;
		setStoppingSub(true);
		try {
			await updateSubscription(currentSubscription.id, { status: "paused" });
			await load();
			showToast("Subscription stopped successfully", "success");
		} catch (error: unknown) {
			showToast(getErrorMessage(error, "Failed to stop subscription"), "error");
		} finally {
			setStoppingSub(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!profile) return;

		if (hasActiveSubscription) {
			showToast(
				"You have an active subscription. Please stop your subscription first before deleting your account.",
				"error",
			);
			return;
		}

		const confirmed = window.confirm(
			"Are you sure you want to delete your account? This action cannot be undone.",
		);
		if (!confirmed) return;

		setDeletingAccount(true);
		try {
			await deleteUser(profile.id);
			logout();
			navigate("/home");
		} catch (error: unknown) {
			showToast(getErrorMessage(error, "Failed to delete account"), "error");
		} finally {
			setDeletingAccount(false);
		}
	};

	if (!user) return null;

	const currentTabMeta =
		PROFILE_TABS.find((t) => t.id === activeTab) ?? PROFILE_TABS[0];

	return (
		<div className="profile-page" style={pageStyles}>
			<Header />

			{toast && (
				<div className={`profile-toast ${toast.type}`}>
					<i
						className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}
					/>
					<span>{toast.message}</span>
				</div>
			)}

			<div className="profile-shell">
				{/* HERO BANNER */}
				<section className="profile-hero">
					<div className="profile-hero-bg" aria-hidden="true">
						<span className="profile-hero-glow profile-hero-glow-1" />
						<span className="profile-hero-glow profile-hero-glow-2" />
					</div>

					<div className="profile-hero-row">
						<div className="profile-hero-identity">
							<div className="profile-hero-avatar-ring">
								<div className="profile-hero-avatar">{profileInitials}</div>
								<span
									className={`profile-hero-status-dot ${
										hasActiveSubscription ? "is-active" : "is-inactive"
									}`}
									title={hasActiveSubscription ? "Active" : "Inactive"}
								/>
							</div>
							<div className="profile-hero-text">
								<span className="profile-hero-eyebrow">
									<i className="bi bi-stars" /> Member Account
								</span>
								<h1>{profile?.name ?? user.name ?? "My Profile"}</h1>
								<div className="profile-hero-meta">
									<span>
										<i className="bi bi-envelope-fill" />
										{profile?.email ?? user.email}
									</span>
									<span>
										<i className="bi bi-calendar2-week-fill" />
										Member since {memberSince}
									</span>
									{currentSubscription && (
										<span
											className="profile-hero-plan-chip"
											style={
												{
													"--chip-color": planColor,
												} as CSSProperties
											}
										>
											<i className="bi bi-tv-fill" />
											{activePlanLabel}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Floating stat cards */}
					<div className="profile-hero-stats">
						<div className="profile-hero-stat">
							<div
								className="profile-hero-stat-icon"
								style={{ background: `${planColor}1a`, color: planColor }}
							>
								<i className="bi bi-tv-fill" />
							</div>
							<div className="profile-hero-stat-text">
								<small>Current plan</small>
								<strong>{activePlanLabel}</strong>
							</div>
						</div>

						<div className="profile-hero-stat">
							<div className="profile-hero-stat-icon profile-stat-icon-amber">
								<i className="bi bi-hourglass-split" />
							</div>
							<div className="profile-hero-stat-text">
								<small>Days remaining</small>
								<strong>
									{subscriptionProgress
										? `${subscriptionProgress.daysLeft} days`
										: "—"}
								</strong>
							</div>
						</div>

						<div className="profile-hero-stat">
							<div className="profile-hero-stat-icon profile-stat-icon-green">
								<i className="bi bi-collection-play-fill" />
							</div>
							<div className="profile-hero-stat-text">
								<small>Total subscriptions</small>
								<strong>{subs.length}</strong>
							</div>
						</div>

						<div className="profile-hero-stat">
							<div
								className={`profile-hero-stat-icon ${
									hasActiveSubscription
										? "profile-stat-icon-green"
										: "profile-stat-icon-muted"
								}`}
							>
								<i
									className={`bi ${
										hasActiveSubscription
											? "bi-shield-check"
											: "bi-shield-exclamation"
									}`}
								/>
							</div>
							<div className="profile-hero-stat-text">
								<small>Status</small>
								<strong>{hasActiveSubscription ? "Active" : "Inactive"}</strong>
							</div>
						</div>
					</div>
				</section>

				{/* LAYOUT: SIDEBAR + MAIN */}
				<div className="profile-layout">
					<aside className="profile-sidebar">
						<nav
							className="profile-nav"
							role="tablist"
							aria-label="Profile sections"
						>
							{PROFILE_TABS.map((tab) => (
								<button
									type="button"
									key={tab.id}
									role="tab"
									aria-selected={activeTab === tab.id}
									className={`profile-nav-item ${
										activeTab === tab.id ? "is-active" : ""
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<span className="profile-nav-icon">
										<i className={`bi ${tab.icon}`} />
									</span>
									<span className="profile-nav-text">
										<strong>{tab.label}</strong>
										<small>{tab.helper}</small>
									</span>
									<i className="bi bi-chevron-right profile-nav-chevron" />
								</button>
							))}
						</nav>

						<div className="profile-support-card">
							<div className="profile-support-icon">
								<i className="bi bi-headset" />
							</div>
							<h3>Need a hand?</h3>
							<p>Our support team is online 24/7 to help with anything.</p>
							<button
								type="button"
								className="profile-support-btn"
								onClick={() => navigate("/contact")}
							>
								Contact Support <i className="bi bi-arrow-right" />
							</button>
						</div>
					</aside>

					<main className="profile-main">
						<header className="profile-main-header">
							<div>
								<span className="profile-main-eyebrow">
									<i className={`bi ${currentTabMeta.icon}`} />{" "}
									{currentTabMeta.helper}
								</span>
								<h2>{currentTabMeta.label}</h2>
							</div>
						</header>

						{activeTab === "personal" && (
							<div className="profile-card">
								<div className="profile-card-head">
									<div>
										<h3>Personal Information</h3>
										<p>
											Update the details we use to identify your account and
											contact you.
										</p>
									</div>
								</div>

								<div className="profile-form">
									<div className="double-input">
										<div className="profile-field profile-field-floating">
											<input
												id="profile-email"
												className="profile-input"
												value={profile?.email ?? user.email}
												placeholder="Email Address"
												disabled
											/>
											<label
												htmlFor="profile-email"
												className="profile-float-label"
											>
												Email Address
											</label>
											<small className="profile-field-hint">
												<i className="bi bi-lock-fill" /> Your email is locked
												for security
											</small>
										</div>

										<div className="profile-field profile-field-floating">
											<input
												id="profile-name"
												className="profile-input"
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="Full Name"
											/>
											<label
												htmlFor="profile-name"
												className="profile-float-label"
											>
												Full Name
											</label>
											<small className="profile-field-hint">
												<i className="bi bi-info-circle" /> Visible on invoices
												and receipts
											</small>
										</div>
									</div>

									<div
										className={`profile-field profile-field-floating profile-phone-field ${
											phone ? "has-value" : ""
										}`}
									>
										<PhoneInput
											defaultCountry="us"
											value={phone}
											onChange={(value) => setPhone(value)}
											inputProps={{
												id: "profile-phone",
												name: "profile-phone",
												placeholder: "Phone Number",
												autoComplete: "tel",
											}}
										/>
										<label
											htmlFor="profile-phone"
											className="profile-float-label"
										>
											Phone Number
										</label>
										<small className="profile-field-hint">
											<i className="bi bi-shield-fill-check" /> Used for account
											recovery and important notifications
										</small>
									</div>

									<div className="profile-actions">
										<button
											type="button"
											className="profile-btn profile-btn-ghost"
											onClick={() => {
												setName(profile?.name ?? "");
												setPhone(profile?.phone ?? "");
											}}
											disabled={savingAccount || loading}
										>
											Discard
										</button>
										<button
											type="button"
											className="profile-btn profile-btn-primary"
											onClick={handleSaveAccount}
											disabled={savingAccount || loading}
										>
											{savingAccount ? (
												<>
													<i className="bi bi-arrow-repeat spin" /> Saving...
												</>
											) : (
												<>
													<i className="bi bi-check2-circle" /> Save Changes
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "subscriptions" && (
							<div className="profile-grid">
								<div className="profile-card profile-current-card">
									<div className="profile-card-head">
										<div>
											<h3>Current Subscription</h3>
											<p>Your active plan with HotIPTV.</p>
										</div>
									</div>

									{loading ? (
										<div className="profile-skeleton" />
									) : !currentSubscription ? (
										<div className="profile-no-sub">
											<div className="profile-no-sub-icon">
												<i className="bi bi-tv" />
											</div>
											<h4>No active subscription</h4>
											<p>
												Pick a plan to start streaming thousands of channels in
												full HD.
											</p>
											<button
												type="button"
												className="profile-btn profile-btn-primary"
												onClick={() => navigate("/plans")}
											>
												<i className="bi bi-rocket-takeoff-fill" /> Browse Plans
											</button>
										</div>
									) : (
										<>
											<div className="profile-billing">
												<div className="profile-billing-top">
													<div>
														<span className="profile-billing-label">
															Active plan
														</span>
														<h4 className="profile-billing-plan">
															{currentSubscription.plan.name}
														</h4>
													</div>
													<span
														className={`profile-status profile-status-${currentSubscription.status} profile-status-on-dark`}
													>
														<i
															className={`bi ${
																currentSubscription.status === "ongoing"
																	? "bi-broadcast"
																	: "bi-clock-history"
															}`}
														/>
														{currentSubscription.status}
													</span>
												</div>

												<div className="profile-billing-grid">
													<div className="profile-billing-cell">
														<small>Price paid</small>
														<strong>
															${Number(currentSubscription.pricePaid).toFixed(2)}
														</strong>
													</div>
													<div className="profile-billing-cell">
														<small>Started</small>
														<strong>
															{formatDate(currentSubscription.startDate)}
														</strong>
													</div>
													<div className="profile-billing-cell">
														<small>Renews / ends</small>
														<strong>
															{formatDate(currentSubscription.endDate)}
														</strong>
													</div>
													<div className="profile-billing-cell">
														<small>Days remaining</small>
														<strong>
															{subscriptionProgress?.daysLeft ?? 0}
														</strong>
													</div>
												</div>

												{subscriptionProgress && (
													<div className="profile-progress">
														<div className="profile-progress-track">
															<div
																className="profile-progress-fill"
																style={{
																	width: `${subscriptionProgress.percent}%`,
																}}
															/>
														</div>
														<div className="profile-progress-meta">
															<span>
																{subscriptionProgress.percent}% used
															</span>
															<span>
																{subscriptionProgress.daysTotal} day plan
															</span>
														</div>
													</div>
												)}
											</div>

											<div className="profile-plan-actions">
												<button
													type="button"
													className="profile-btn plan-btn-renew"
													onClick={() => navigate("/plans")}
												>
													<i className="bi bi-arrow-clockwise" /> Renew Plan
												</button>
												<button
													type="button"
													className="profile-btn plan-btn-cancel"
													onClick={handleStopSubscription}
													disabled={
														stoppingSub ||
														currentSubscription.status === "paused"
													}
												>
													<i className="bi bi-pause-circle" />{" "}
													{stoppingSub ? "Stopping..." : "Stop Plan"}
												</button>
											</div>
										</>
									)}
								</div>

								<div className="profile-card">
									<div className="profile-card-head">
										<div>
											<h3>Billing History</h3>
											<p>All your past and current subscriptions.</p>
										</div>
										<span className="profile-pill">
											{historySubscriptions.length} entries
										</span>
									</div>

									<div className="profile-history">
										{loading ? (
											<div className="profile-skeleton" />
										) : historySubscriptions.length === 0 ? (
											<div className="profile-empty-state">
												<i className="bi bi-receipt" />
												<p>No subscription history yet.</p>
											</div>
										) : (
											historySubscriptions.map((s) => (
												<div
													className="profile-history-item"
													key={s.id}
													style={
														{
															"--row-color": s.plan.color ?? "#ff3b3b",
														} as CSSProperties
													}
												>
													<span className="profile-history-bar" />
													<div className="profile-history-body">
														<div className="profile-history-top">
															<div className="profile-history-name">
																{s.plan.name}
															</div>
															<span
																className={`profile-status profile-status-${s.status}`}
															>
																{s.status}
															</span>
														</div>
														<div className="profile-history-meta">
															<span>
																<i className="bi bi-calendar3" />
																{formatDate(s.startDate)} →{" "}
																{formatDate(s.endDate)}
															</span>
															<span>
																<i className="bi bi-cash-coin" />$
																{Number(s.pricePaid).toFixed(2)}
															</span>
														</div>
													</div>
												</div>
											))
										)}
									</div>
								</div>
							</div>
						)}

						{activeTab === "security" && (
							<div className="profile-card">
								<div className="profile-card-head">
									<div>
										<h3>Password & Security</h3>
										<p>
											Use a strong password — at least 8 characters with a mix
											of letters, numbers and symbols.
										</p>
									</div>
								</div>

								<div className="profile-form">
									<div className="profile-field profile-field-floating profile-password-field">
										<input
											id="profile-current-password"
											className="profile-input"
											type={showOldPassword ? "text" : "password"}
											value={oldPassword}
											onChange={(e) => setOldPassword(e.target.value)}
											placeholder="Current Password"
											autoComplete="current-password"
										/>
										<label
											htmlFor="profile-current-password"
											className="profile-float-label"
										>
											Current Password
										</label>
										<button
											type="button"
											className="profile-password-toggle"
											onClick={() => setShowOldPassword((v) => !v)}
											aria-label={
												showOldPassword ? "Hide password" : "Show password"
											}
										>
											<i
												className={`bi ${showOldPassword ? "bi-eye-slash" : "bi-eye"}`}
											/>
										</button>
									</div>

									<div className="double-input">
										<div className="profile-field profile-field-floating profile-password-field">
											<input
												id="profile-new-password"
												className="profile-input"
												type={showNewPassword ? "text" : "password"}
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												placeholder="New Password"
												autoComplete="new-password"
											/>
											<label
												htmlFor="profile-new-password"
												className="profile-float-label"
											>
												New Password
											</label>
											<button
												type="button"
												className="profile-password-toggle"
												onClick={() => setShowNewPassword((v) => !v)}
												aria-label={
													showNewPassword ? "Hide password" : "Show password"
												}
											>
												<i
													className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`}
												/>
											</button>
										</div>

										<div className="profile-field profile-field-floating profile-password-field">
											<input
												id="profile-confirm-password"
												className="profile-input"
												type={showConfirmPassword ? "text" : "password"}
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												placeholder="Confirm New Password"
												autoComplete="new-password"
											/>
											<label
												htmlFor="profile-confirm-password"
												className="profile-float-label"
											>
												Confirm New Password
											</label>
											<button
												type="button"
												className="profile-password-toggle"
												onClick={() => setShowConfirmPassword((v) => !v)}
												aria-label={
													showConfirmPassword
														? "Hide password"
														: "Show password"
												}
											>
												<i
													className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
												/>
											</button>
										</div>
									</div>

									{newPassword && (
										<div
											className="profile-strength"
											data-strength={passwordStrength.score}
										>
											<div className="profile-strength-track">
												{[0, 1, 2, 3, 4].map((i) => (
													<span
														key={i}
														className={
															i < passwordStrength.score ? "is-on" : ""
														}
													/>
												))}
											</div>
											<small className="profile-strength-label">
												Password strength:{" "}
												<strong>{passwordStrength.label}</strong>
											</small>
										</div>
									)}

									<ul className="profile-tips">
										<li
											className={newPassword.length >= 8 ? "is-ok" : ""}
										>
											<i className="bi bi-check2" /> At least 8 characters
										</li>
										<li
											className={
												/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
													? "is-ok"
													: ""
											}
										>
											<i className="bi bi-check2" /> Mix uppercase & lowercase
										</li>
										<li className={/\d/.test(newPassword) ? "is-ok" : ""}>
											<i className="bi bi-check2" /> Contains a number
										</li>
										<li
											className={
												/[^A-Za-z0-9]/.test(newPassword) ? "is-ok" : ""
											}
										>
											<i className="bi bi-check2" /> Contains a symbol
										</li>
									</ul>

									<div className="profile-actions">
										<button
											type="button"
											className="profile-btn profile-btn-primary"
											onClick={handleChangePassword}
											disabled={savingPassword || loading}
										>
											{savingPassword ? (
												<>
													<i className="bi bi-arrow-repeat spin" /> Updating...
												</>
											) : (
												<>
													<i className="bi bi-shield-lock-fill" /> Update
													Password
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "account" && (
							<div className="profile-card">
								<div className="profile-card-head">
									<div>
										<h3>Account Settings</h3>
										<p>Manage your account preferences and data.</p>
									</div>
								</div>

								<div className="profile-account-summary">
									<div className="profile-summary-row">
										<span className="profile-summary-label">
											<i className="bi bi-envelope-fill" /> Email
										</span>
										<span className="profile-summary-value">
											{profile?.email ?? user.email}
										</span>
									</div>
									<div className="profile-summary-row">
										<span className="profile-summary-label">
											<i className="bi bi-broadcast" /> Active subscription
										</span>
										<span className="profile-summary-value">
											{hasActiveSubscription ? "Yes" : "No"}
										</span>
									</div>
									<div className="profile-summary-row">
										<span className="profile-summary-label">
											<i className="bi bi-calendar2-week-fill" /> Member since
										</span>
										<span className="profile-summary-value">{memberSince}</span>
									</div>
								</div>

								<div className="profile-danger-panel">
									<div className="profile-danger-head">
										<div className="profile-danger-icon">
											<i className="bi bi-exclamation-triangle-fill" />
										</div>
										<div>
											<h4>Danger Zone</h4>
											<p>
												Permanently delete your account and all associated
												data. This action cannot be undone.
											</p>
										</div>
									</div>

									<ul className="profile-danger-list">
										<li>
											<i className="bi bi-x-circle" /> All your subscription
											history will be removed
										</li>
										<li>
											<i className="bi bi-x-circle" /> You will lose access to
											your account immediately
										</li>
										<li>
											<i className="bi bi-x-circle" /> Active subscriptions
											must be stopped first
										</li>
									</ul>

									<div className="profile-actions profile-actions-start">
										<button
											type="button"
											className="profile-btn profile-btn-danger"
											onClick={handleDeleteAccount}
											disabled={deletingAccount || loading}
										>
											<i className="bi bi-trash3-fill" />{" "}
											{deletingAccount
												? "Deleting..."
												: "Delete My Account"}
										</button>
									</div>
								</div>
							</div>
						)}
					</main>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default Profile;
