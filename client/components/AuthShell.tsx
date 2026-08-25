export default function AuthShell({
  heading,
  subtext,
  children,
  footer,
}: {
  heading: string;
  subtext?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-frame">
        <div className="auth-brand">
          <div className="auth-brand-mark">A</div>
          <span className="auth-brand-name">Acme</span>
        </div>

        <div className="card">
          <h1 className="auth-heading">{heading}</h1>
          {subtext && <p className="auth-subtext">{subtext}</p>}
          {children}
        </div>

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}
