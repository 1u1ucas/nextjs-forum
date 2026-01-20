# Ralph Plan - Product Brain Phase (PowerShell)
# Explores codebase and generates feature/story proposals

$ErrorActionPreference = "Stop"

$RalphDir = $PSScriptRoot
$ProjectDir = Split-Path $RalphDir -Parent
$OutputFile = Join-Path $RalphDir "plan_output.md"
$DraftFile = Join-Path $RalphDir "prd_draft.json"

function Write-Log {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "[Plan] $Message" -ForegroundColor $Color
}

function Build-PlanPrompt {
    $planRules = Get-Content (Join-Path $RalphDir "plan_prompt.md") -Raw

    return @"
$planRules

---

## Project Location
$ProjectDir

## Key Files to Explore
- README.md (if exists)
- CLAUDE.md (project instructions)
- package.json (dependencies)
- app/ directory (routes)
- components/ directory (UI)
- lib/ directory (utilities)
- hooks/ directory (React hooks)

Begin your analysis now. Explore the codebase, identify opportunities, and propose stories.
"@
}

function Main {
    Write-Host ""
    Write-Log "================================================" "Cyan"
    Write-Log "  Ralph Plan - Product Brain Phase" "Cyan"
    Write-Log "================================================" "Cyan"
    Write-Log "Project: $ProjectDir"
    Write-Host ""

    # Check Claude CLI
    if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
        Write-Log "Claude CLI not found" "Red"
        exit 1
    }

    Write-Log "Generating planning prompt..."
    $prompt = Build-PlanPrompt

    # Estimate tokens
    $tokenEstimate = [math]::Round($prompt.Length / 4)
    Write-Log "Prompt size: ~$tokenEstimate tokens"

    # Save for debug
    $prompt | Out-File (Join-Path $RalphDir "plan_last_prompt.txt") -Encoding UTF8

    Write-Log "Launching Claude for codebase analysis..."
    Write-Log "(This may take a few minutes)"
    Write-Host ""

    Push-Location $ProjectDir

    try {
        $output = & claude --print $prompt 2>&1
        $output | Out-File $OutputFile -Encoding UTF8

        Write-Log "Analysis complete!" "Green"

        # Try to extract JSON
        Write-Log "Extracting proposed stories..."

        $outputContent = Get-Content $OutputFile -Raw
        if ($outputContent -match '```json\s*([\s\S]*?)\s*```') {
            $jsonContent = $matches[1]
            $jsonContent | Out-File $DraftFile -Encoding UTF8
            Write-Log "Draft stories saved to: $DraftFile" "Green"
        }
    }
    catch {
        Write-Log "Claude error: $_" "Yellow"
    }
    finally {
        Pop-Location
    }

    Write-Host ""
    Write-Log "================================================" "Green"
    Write-Log "         PLANNING COMPLETE" "Green"
    Write-Log "================================================" "Green"
    Write-Host ""
    Write-Log "Output: $OutputFile"
    Write-Log "Draft:  $DraftFile"
    Write-Host ""
    Write-Log "NEXT STEPS:" "Yellow"
    Write-Host "  1. Review the analysis in plan_output.md"
    Write-Host "  2. Edit prd_draft.json or copy to prd.json"
    Write-Host "  3. Set 'approved: true' on stories you want"
    Write-Host "  4. Run .\ralph.ps1 to execute approved stories"
    Write-Host ""
}

Main
