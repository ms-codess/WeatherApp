'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modal =
    mounted && open
      ? createPortal(
          <>
            <div className="info-modal__backdrop" onClick={() => setOpen(false)} />
            <div className="info-modal" role="dialog" aria-modal="true" aria-labelledby="about-title">
              <button
                type="button"
                className="info-modal__close"
                aria-label="Close about dialog"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
              <p className="eyebrow">About This App</p>
              <h3 id="about-title">Weather Trip Planner</h3>
              <p>
                Created by <strong>Meyssa Smirani</strong>
              </p>
              <p>
                Weather Trip Planner helps you explore destinations, align travel dates with real-time
                forecasts, and save plans for later.
              </p>
              <h4> About PM Accelerator</h4>
              <p>
                PM Accelerator is a global program dedicated to helping aspiring and early-career Product
                Managers gain real project experience, improve their product thinking, and build strong
                portfolios through hands-on assessments and expert guidance.
              </p>
              <a
                href="https://www.linkedin.com/company/product-manager-accelerator"
                target="_blank"
                rel="noreferrer"
                className="pill-link"
              >
                Learn more on LinkedIn
              </a>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="info-button"
        aria-label="About this app"
        onClick={() => setOpen(true)}
      >
        i
      </button>
      {modal}
    </>
  );
}
