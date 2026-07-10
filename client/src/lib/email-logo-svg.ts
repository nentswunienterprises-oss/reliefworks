export function getReliefWorksEmailLogoSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="64" viewBox="0 0 240 64" fill="none">
      <rect width="240" height="64" rx="16" fill="#040414"/>
      <text x="20" y="31" fill="#FFFFFF" font-family="Georgia, 'Times New Roman', serif" font-size="24">Relief Works</text>
      <text x="21" y="47" fill="rgba(255,255,255,0.72)" font-family="Arial, sans-serif" font-size="8" letter-spacing="4.4">TECHNOLOGIES</text>
    </svg>
  `.trim();
}

export function getReliefWorksEmailLogoDataUri() {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getReliefWorksEmailLogoSvg())}`;
}

