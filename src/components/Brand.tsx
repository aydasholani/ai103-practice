type BrandProps = {
  asButton?: boolean;
  onClick?: () => void;
};

export function Brand({ asButton = false, onClick }: BrandProps) {
  const content = (
    <>
      <span className="brand-mark">A</span>
      <span>AI-103 Practice</span>
    </>
  );

  if (asButton) {
    return (
      <button
        className="brand brand-button"
        onClick={onClick}
        aria-label="Back to home"
      >
        {content}
      </button>
    );
  }

  return <div className="brand">{content}</div>;
}
