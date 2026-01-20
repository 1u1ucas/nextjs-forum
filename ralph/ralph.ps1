# Ralph - Autonomous Development Agent (Optimized for Token Efficiency)
# Phase 2: Execution - Only works on APPROVED stories

param(
    [int]$MaxIterations = 15,
    [int]$ProgressLines = 25,
    [int]$PrdSummaryLines = 15
)

$ErrorActionPreference = "Stop"

$RalphDir = $PSScriptRoot
$ProjectDir = Split-Path $RalphDir -Parent
$LogFile = Join-Path $RalphDir "ralph.log"
$OutputFile = Join-Path $RalphDir "output.txt"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $fullTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
    Add-Content -Path $LogFile -Value "[$fullTimestamp] $Message"
}

function Get-PrdData {
    return Get-Content (Join-Path $RalphDir "prd.json") -Raw | ConvertFrom-Json
}

# Get first story where approved=true AND done=false
function Get-ActiveStory {
    $prdJson = Get-PrdData
    $activeStory = $prdJson.stories | Where-Object { $_.approved -eq $true -and $_.done -eq $false } | Select-Object -First 1

    if ($null -eq $activeStory) {
        return $null
    }

    $acceptance = if ($activeStory.acceptance_criteria) { $activeStory.acceptance_criteria -join ", " } else { "" }
    $filesToModify = if ($activeStory.files_to_modify) { $activeStory.files_to_modify -join ", " } else { "" }
    $filesToCreate = if ($activeStory.files_to_create) { $activeStory.files_to_create -join ", " } else { "" }
    $feature = if ($activeStory.feature) { $activeStory.feature } else { "N/A" }

    return @{
        Id = $activeStory.id
        Feature = $feature
        Title = $activeStory.title
        Prompt = $activeStory.prompt
        Acceptance = $acceptance
        FilesToModify = $filesToModify
        FilesToCreate = $filesToCreate
    }
}

function Get-RemainingCount {
    $prdJson = Get-PrdData
    return ($prdJson.stories | Where-Object { $_.approved -eq $true -and $_.done -eq $false }).Count
}

function Get-ApprovedCount {
    $prdJson = Get-PrdData
    return ($prdJson.stories | Where-Object { $_.approved -eq $true }).Count
}

function Get-UnapprovedCount {
    $prdJson = Get-PrdData
    return ($prdJson.stories | Where-Object { $_.approved -ne $true }).Count
}

function Build-MinimalPrompt {
    $story = Get-ActiveStory
    if ($null -eq $story) { return $null }

    $promptRules = Get-Content (Join-Path $RalphDir "prompt.md") -Raw
    $prdSummary = Get-Content (Join-Path $RalphDir "PRD.md") -TotalCount $PrdSummaryLines | Out-String
    $progressTail = Get-Content (Join-Path $RalphDir "progress.txt") -Tail $ProgressLines | Out-String

    $storyText = @"
ID: $($story.Id)
Feature: $($story.Feature)
Title: $($story.Title)
Prompt: $($story.Prompt)
Acceptance: $($story.Acceptance)
Files to modify: $($story.FilesToModify)
Files to create: $($story.FilesToCreate)
"@

    $combinedPrompt = @"
$promptRules

---

## Feature Context (PRD Summary)
$prdSummary

---

## Current Story (#$($story.Id)) [APPROVED]
$storyText

---

## Recent Progress (last $ProgressLines lines)
$progressTail

---

NOW: Implement story #$($story.Id). Be concise. Commit when done. Update prd.json and progress.txt.
"@

    return @{
        Prompt = $combinedPrompt
        StoryId = $story.Id
    }
}

function Invoke-Iteration {
    param([int]$Iteration)

    $remaining = Get-RemainingCount
    $promptData = Build-MinimalPrompt

    if ($null -eq $promptData) {
        return $true  # No more approved stories
    }

    Write-Log "=== Iteration $Iteration/$MaxIterations | Story #$($promptData.StoryId) | $remaining approved remaining ===" "Cyan"

    # Token estimate
    $tokenEstimate = [math]::Round($promptData.Prompt.Length / 4)
    Write-Log "Prompt size: ~$tokenEstimate tokens"

    # Save for debug
    $promptData.Prompt | Out-File (Join-Path $RalphDir "last_prompt.txt") -Encoding UTF8

    Push-Location $ProjectDir

    try {
        $output = & claude --print --dangerously-skip-permissions $promptData.Prompt 2>&1
        $output | Out-File $OutputFile -Encoding UTF8

        Write-Log "Claude completed iteration $Iteration" "Green"

        if ($output -match "COMPLETE") {
            return $true
        }
    }
    catch {
        Write-Log "Claude error: $_" "Yellow"
    }
    finally {
        Pop-Location
    }

    return $false
}

function Main {
    Write-Host ""
    Write-Log "================================================" "Cyan"
    Write-Log "  Ralph - Execution Phase (Approved)" "Cyan"
    Write-Log "================================================" "Cyan"
    Write-Log "Project: $ProjectDir"
    Write-Log "Max iterations: $MaxIterations"
    Write-Host ""

    # Check Claude CLI
    if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
        Write-Log "Claude CLI not found" "Red"
        exit 1
    }

    # Check required files
    foreach ($file in @("PRD.md", "prd.json", "prompt.md", "progress.txt")) {
        if (-not (Test-Path (Join-Path $RalphDir $file))) {
            Write-Log "$file not found" "Red"
            exit 1
        }
    }

    $approved = Get-ApprovedCount
    $remaining = Get-RemainingCount
    $unapproved = Get-UnapprovedCount

    Write-Log "Stories status:"
    Write-Log "  - Approved & pending: $remaining"
    Write-Log "  - Approved & done:    $($approved - $remaining)"
    Write-Log "  - Not approved:       $unapproved"
    Write-Host ""

    if ($approved -eq 0) {
        Write-Log "No approved stories found!" "Yellow"
        Write-Log "Run .\ralph-plan.ps1 first, then set 'approved: true' on stories you want." "Yellow"
        exit 0
    }

    if ($remaining -eq 0) {
        Write-Log "All approved stories are complete!" "Green"
        exit 0
    }

    Write-Log "Starting execution of $remaining approved stories"
    Write-Host ""

    for ($i = 1; $i -le $MaxIterations; $i++) {
        if (Invoke-Iteration -Iteration $i) {
            Write-Host ""
            Write-Log "================================================" "Green"
            Write-Log "    ALL APPROVED STORIES COMPLETE!" "Green"
            Write-Log "================================================" "Green"
            Write-Log "Finished in $i iterations" "Green"
            exit 0
        }

        $remaining = Get-RemainingCount
        if ($remaining -eq 0) {
            Write-Log "All approved stories done!" "Green"
            exit 0
        }

        Start-Sleep -Seconds 1
    }

    Write-Log "Max iterations reached. Remaining approved: $(Get-RemainingCount)" "Yellow"
    exit 1
}

Main
