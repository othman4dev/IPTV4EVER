import React, { useState } from "react";
import "../assets/css/faq.css";

const FAQ_DATA = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and several local payment options depending on your country.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time from your account dashboard. There are no hidden fees or penalties.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Absolutely! We offer a 7-day free trial so you can experience all features before committing.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We use industry-standard encryption and security practices to keep your data safe and private.",
  },
  {
    question: "How do I get support?",
    answer:
      "Our support team is available 24/7 via live chat and email. You can also find helpful resources in our Help Center.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="faq-section">
      <div className="faq-header">
        <h2 className="faq-title">
          {"Frequently Asked Questions".split(" ").map((word, i) => (
            <span className="faq-title-word" key={i}>
              <span className="faq-title-fl">{word[0]}</span>
              <span className="faq-title-rest">{word.slice(1)}</span>{" "}
            </span>
          ))}
        </h2>
        {/* <p className="faq-subtitle">
          Everything you need to know before getting started.
        </p> */}
      </div>
      <div className="faq-list">
        {FAQ_DATA.map((item, idx) => (
          <div
            className={`faq-item${openIndex === idx ? " open" : ""}`}
            key={item.question}
          >
            <button
              className="faq-question"
              onClick={() => handleToggle(idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-answer-${idx}`}
            >
              <span>{item.question}</span>
              <span className="faq-icon">
                <div className="faq-s-circle"></div>
                {openIndex === idx ? (
                  <i className="bi bi-chevron-up"></i>
                ) : (
                  <i className="bi bi-chevron-down"></i>
                )}
              </span>
            </button>
            <div
              className={`faq-answer-wrapper${openIndex === idx ? " open" : ""}`}
              id={`faq-answer-${idx}`}
            >
              <div className="faq-answer">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
