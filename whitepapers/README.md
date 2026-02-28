# A2AX-Core Whitepapers

LaTeX source documents for the A2AX-Core Protocol.

## Documents

| Document | Purpose | Source | PDF |
|----------|---------|--------|-----|
| **001** A2AX-Core Open Trust Standard | Main whitepaper — narrative, comprehensive, arXiv-style | [.tex](001_A2AX_Core_Open_Trust_Standard.tex) | [PDF](001_A2AX__The_Open_Trust_Standard_for_Autonomous_Agents.pdf) |
| **002** A2AX-Core Overview (Informational) | Short companion — positioning, high-level | [.tex](002_A2AX_Core_Overview_Informational.tex) | [PDF](002_A2AX-Core%20Informational%20Overview.pdf) |
| **003** A2AX-Core Protocol Specification | Normative specification — formal conformance (MUST, SHOULD) | [.tex](003_A2AX_Core_Protocol_Specification.tex) | [PDF](003_A2AX-Core%20Protocol%20Specification.pdf) |

## Building PDFs

**Prerequisites:** `pdflatex` (TeX Live, MiKTeX, or similar)

**Unix / Git Bash:**
```bash
./build.sh
# PDFs written to whitepapers/pdf/
```

**Windows (PowerShell):**
```powershell
.\build.ps1
# PDFs written to whitepapers\pdf\
```

**Custom output directory:**
```bash
./build.sh /path/to/output
```
```powershell
.\build.ps1 -OutputDir C:\path\to\output
```

## Version

Release v0.1.3 | Protocol Specification v1.0
