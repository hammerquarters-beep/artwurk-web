import React, { useMemo, useState } from "react";

import CollectorMenu from "../components/CollectorMenu";
import {
  ArtworkIcon,
  PhoneIcon,
  TagIcon,
  UploadIcon,
} from "../components/ArtwurkIcons";
import { trackLead } from "../lib/tracking";

type AppraisalFormState = {
  artistName: string;
  email: string;
  phone: string;
  artworkTitle: string;
  medium: string;
  dimensions: string;
  askingPrice: string;
  cityState: string;
  message: string;
};

type SubmissionState = {
  status: "idle" | "success";
  message?: string;
};

const initialForm: AppraisalFormState = {
  artistName: "",
  email: "",
  phone: "",
  artworkTitle: "",
  medium: "",
  dimensions: "",
  askingPrice: "",
  cityState: "",
  message: "",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="appraisal-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="appraisal-info-row">
      <div className="appraisal-info-head">
        {icon}
        <div>{title}</div>
      </div>
      <p>{text}</p>
    </div>
  );
}

export default function AppraisalPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState<AppraisalFormState>(initialForm);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
  });

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.artistName &&
          form.email &&
          form.artworkTitle &&
          form.medium &&
          form.dimensions,
      ),
    [form],
  );

  const update = (key: keyof AppraisalFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    trackLead({
      route: "/appraisal",
      page: "appraisal",
      source: "appraisal-intake",
      status: "new",
      intent: "general",
      customer: {
        name: form.artistName,
        email: form.email,
        phone: form.phone,
      },
      metadata: {
        artworkTitle: form.artworkTitle,
        medium: form.medium,
        dimensions: form.dimensions,
        askingPrice: form.askingPrice,
        cityState: form.cityState,
        message: form.message,
        uploadedFiles: files.map((file) => file.name),
      },
    });

    setSubmissionState({
      status: "success",
      message: "Submission recorded. Hammer HQ can now review and follow up from the ARTWURK CRM flow.",
    });
    setForm(initialForm);
    setFiles([]);
  };

  return (
    <div className="appraisal-page">
      <div className="appraisal-shell">
        <div className="appraisal-topbar">
          <CollectorMenu />
          <a href="/" className="appraisal-back-link">
            Back to Gallery
          </a>
        </div>

        <section className="appraisal-hero">
          <div className="appraisal-hero-kicker">Acquisition Intake</div>
          <h1>Artwork Appraisal & Acquisition</h1>
          <p>
            Submit your work for review by ARTWURK. Hammer HQ may appraise, consider direct purchase,
            or evaluate the piece for marketing and collector placement. This intake is built for artists
            ready to be seen, valued, and positioned with intention.
          </p>
        </section>

        <div className="appraisal-layout">
          <section className="appraisal-form-panel">
            <div className="appraisal-section-kicker">Artist Submission</div>

            <div className="appraisal-grid two-col">
              <Field label="Artist Name">
                <input
                  value={form.artistName}
                  onChange={(event) => update("artistName", event.target.value)}
                  className="appraisal-input"
                  placeholder="Your full name"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className="appraisal-input"
                  placeholder="you@example.com"
                />
              </Field>
            </div>

            <div className="appraisal-grid two-col">
              <Field label="Phone or WhatsApp">
                <input
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className="appraisal-input"
                  placeholder="+1 (000) 000-0000"
                />
              </Field>
              <Field label="Artwork Title">
                <input
                  value={form.artworkTitle}
                  onChange={(event) => update("artworkTitle", event.target.value)}
                  className="appraisal-input"
                  placeholder="Title of the piece"
                />
              </Field>
            </div>

            <div className="appraisal-grid three-col">
              <Field label="Medium">
                <input
                  value={form.medium}
                  onChange={(event) => update("medium", event.target.value)}
                  className="appraisal-input"
                  placeholder="Acrylic on canvas"
                />
              </Field>
              <Field label="Dimensions">
                <input
                  value={form.dimensions}
                  onChange={(event) => update("dimensions", event.target.value)}
                  className="appraisal-input"
                  placeholder="24 x 36"
                />
              </Field>
              <Field label="Asking Price">
                <input
                  value={form.askingPrice}
                  onChange={(event) => update("askingPrice", event.target.value)}
                  className="appraisal-input"
                  placeholder="$2,500"
                />
              </Field>
            </div>

            <Field label="City / State">
              <input
                value={form.cityState}
                onChange={(event) => update("cityState", event.target.value)}
                className="appraisal-input"
                placeholder="Los Angeles, CA"
              />
            </Field>

            <Field label="Artwork Story / Notes">
              <textarea
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                className="appraisal-input appraisal-textarea"
                placeholder="Share the story, condition, year created, and anything that helps us evaluate the piece."
              />
            </Field>

            <Field label="Upload Artwork Images">
              <label className="appraisal-upload">
                <UploadIcon className="appraisal-upload-icon" />
                <div className="appraisal-upload-title">Add files</div>
                <div className="appraisal-upload-copy">
                  Front image, angle image, close-up details, and back of artwork recommended.
                </div>
                <input
                  type="file"
                  multiple
                  className="appraisal-hidden-input"
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                />
              </label>
              {files.length ? (
                <div className="appraisal-files">
                  {files.map((file) => (
                    <div key={file.name} className="appraisal-file-pill">
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : null}
            </Field>

            {submissionState.message ? (
              <div className="appraisal-status">{submissionState.message}</div>
            ) : null}

            <button
              type="button"
              disabled={!canSubmit}
              className="appraisal-submit"
              onClick={handleSubmit}
            >
              Submit for Review
            </button>
          </section>

          <aside className="appraisal-sidebar">
            <section className="appraisal-side-panel">
              <div className="appraisal-section-kicker">What to Include</div>
              <div className="appraisal-side-grid">
                <InfoRow
                  icon={<ArtworkIcon className="appraisal-info-icon" />}
                  title="Clear images"
                  text="Front, side angle, texture detail, signature, and back whenever possible."
                />
                <InfoRow
                  icon={<TagIcon className="appraisal-info-icon" />}
                  title="Dimensions + medium"
                  text="This helps us understand scale, category, and potential market position."
                />
                <InfoRow
                  icon={<PhoneIcon className="appraisal-info-icon" />}
                  title="Fast response path"
                  text="Include the best contact method if you want a quicker acquisition conversation."
                />
              </div>
            </section>

            <section className="appraisal-side-panel">
              <div className="appraisal-section-kicker">General Contact</div>
              <div className="appraisal-contact-block">
                <a href="mailto:hammerhq@outlook.com">hammerhq@outlook.com</a>
                <a href="tel:+12096842964">+1 (209) 684-2964</a>
                <p>
                  For private questions, artwork availability, or general information, use the contact
                  page or collector inquiry forms.
                </p>
              </div>
            </section>

            <section className="appraisal-note-panel">
              <div className="appraisal-section-kicker">Future Financial Infrastructure</div>
              <p>
                This intake system helps ARTWURK build documented catalog depth, acquisition flow, and
                deal history - the kind of operating record that strengthens the company over time.
              </p>
            </section>
          </aside>
        </div>

        <footer className="appraisal-footer">A Hammer HQ LLC company</footer>
      </div>

      <style jsx>{`
        .appraisal-page {
          min-height: 100vh;
          background: #040404;
          color: #f7f2e8;
          padding: 32px 16px;
          font-family: "Times New Roman", Georgia, serif;
        }

        .appraisal-shell {
          width: min(1280px, 100%);
          margin: 0 auto;
        }

        .appraisal-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 32px;
        }

        .appraisal-back-link {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0 20px;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(247, 242, 232, 0.85);
          transition: border-color 180ms ease, color 180ms ease;
        }

        .appraisal-back-link:hover {
          border-color: rgba(212, 175, 55, 0.4);
          color: #f7f2e8;
        }

        .appraisal-hero {
          overflow: hidden;
          border-radius: 32px;
          border: 1px solid rgba(212, 175, 55, 0.16);
          background: radial-gradient(circle at top, rgba(212, 175, 55, 0.12), transparent 26%), #070707;
          padding: 40px 28px;
        }

        .appraisal-hero-kicker,
        .appraisal-section-kicker {
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .appraisal-hero h1 {
          margin: 16px 0 0;
          font-size: clamp(2.2rem, 5vw, 4.2rem);
          line-height: 1.02;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .appraisal-hero p {
          max-width: 820px;
          margin: 20px 0 0;
          font-size: 17px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.72);
        }

        .appraisal-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 32px;
          margin-top: 32px;
        }

        .appraisal-form-panel,
        .appraisal-side-panel,
        .appraisal-note-panel {
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          padding: 28px;
        }

        .appraisal-grid {
          display: grid;
          gap: 20px;
          margin-top: 22px;
        }

        .appraisal-grid.two-col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .appraisal-grid.three-col {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .appraisal-field {
          display: grid;
          gap: 10px;
          margin-top: 22px;
        }

        .appraisal-field span {
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .appraisal-input {
          min-height: 56px;
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0a0a0a;
          padding: 0 16px;
          color: #f7f2e8;
          outline: none;
          font-size: 15px;
          font-family: "Times New Roman", Georgia, serif;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .appraisal-input::placeholder {
          color: rgba(247, 242, 232, 0.28);
        }

        .appraisal-input:focus {
          border-color: rgba(212, 175, 55, 0.45);
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.18);
        }

        .appraisal-textarea {
          min-height: 180px;
          padding-top: 16px;
          padding-bottom: 16px;
          resize: vertical;
        }

        .appraisal-upload {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          border: 1px dashed rgba(212, 175, 55, 0.28);
          background: #0b0b0b;
          text-align: center;
          cursor: pointer;
          transition: border-color 180ms ease, background 180ms ease;
        }

        .appraisal-upload:hover {
          border-color: rgba(212, 175, 55, 0.45);
          background: #101010;
        }

        .appraisal-upload-icon,
        .appraisal-info-icon {
          width: 18px;
          height: 18px;
          color: #d4af37;
          flex-shrink: 0;
        }

        .appraisal-upload-title {
          margin-top: 14px;
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .appraisal-upload-copy {
          margin-top: 8px;
          max-width: 420px;
          padding: 0 24px;
          font-size: 14px;
          line-height: 1.8;
          color: rgba(247, 242, 232, 0.56);
        }

        .appraisal-hidden-input {
          display: none;
        }

        .appraisal-files {
          display: grid;
          gap: 8px;
          margin-top: 16px;
        }

        .appraisal-file-pill {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          padding: 12px 16px;
          font-size: 14px;
          color: rgba(247, 242, 232, 0.75);
        }

        .appraisal-status {
          margin-top: 18px;
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.28);
          background: rgba(212, 175, 55, 0.08);
          padding: 14px 16px;
          font-size: 15px;
          line-height: 1.7;
        }

        .appraisal-submit {
          min-height: 60px;
          margin-top: 20px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 24px;
          background: linear-gradient(to right, #c89d3f, #f0d98c);
          padding: 0 32px;
          color: #080808;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          cursor: pointer;
          transition: transform 180ms ease, opacity 180ms ease;
        }

        .appraisal-submit:hover:enabled {
          transform: scale(1.01);
        }

        .appraisal-submit:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .appraisal-sidebar {
          display: grid;
          gap: 24px;
          align-self: start;
        }

        .appraisal-side-grid {
          display: grid;
          gap: 16px;
          margin-top: 18px;
        }

        .appraisal-info-row {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: #0b0b0b;
          padding: 16px;
        }

        .appraisal-info-head {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .appraisal-info-row p,
        .appraisal-contact-block,
        .appraisal-note-panel p {
          margin: 10px 0 0;
          font-size: 14px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.72);
        }

        .appraisal-contact-block {
          display: grid;
          gap: 8px;
        }

        .appraisal-contact-block a {
          color: rgba(247, 242, 232, 0.8);
          text-decoration: none;
        }

        .appraisal-contact-block a:hover {
          color: #f7f2e8;
        }

        .appraisal-note-panel {
          border-color: rgba(212, 175, 55, 0.16);
          background: rgba(212, 175, 55, 0.06);
        }

        .appraisal-footer {
          margin-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 26px 8px 0;
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(247, 242, 232, 0.42);
        }

        @media (max-width: 1100px) {
          .appraisal-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .appraisal-grid.two-col,
          .appraisal-grid.three-col {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .appraisal-page {
            padding: 22px 14px;
          }

          .appraisal-hero,
          .appraisal-form-panel,
          .appraisal-side-panel,
          .appraisal-note-panel {
            padding: 24px 20px;
          }

          .appraisal-topbar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
