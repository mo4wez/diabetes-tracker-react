import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    direction: rtl;
    font-size: 16px;
    color-scheme: ${({ theme }) => theme.mode};
    -webkit-font-smoothing: antialiased;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.bgApp};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.6;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  input, button, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  input[type='number'],
  input[type='time'],
  .ltr-number {
    direction: ltr;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  .print-only {
    display: none !important;
  }

  @media print {
    @page {
      size: A4 landscape;
      margin: 10mm;
    }

    html {
      color-scheme: light !important;
    }

    html, body {
      background: #ffffff !important;
      color: #000000 !important;
      font-size: 11pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }

    .print-only {
      display: block !important;
    }

    tr, .avoid-page-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`;
