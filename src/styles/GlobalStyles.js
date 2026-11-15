// Reset, RTL/LTR direction setup, and @media print rules
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
    -webkit-font-smoothing: antialiased;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.bgApp};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.6;
  }

  input, button, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  /* Keep numeric blood glucose and insulin inputs left-to-right for clean alignment */
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

  /* Elements visible only on screen vs only when printing */
  .print-only {
    display: none !important;
  }

  @media print {
    @page {
      size: A4 landscape;
      margin: 10mm;
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

    /* Prevent table rows or day cards from splitting awkwardly across pages */
    tr, .avoid-page-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`;
