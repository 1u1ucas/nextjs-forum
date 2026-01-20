#!/bin/bash

# Ralph - Autonomous Development Agent (Optimized for Token Efficiency)
# Phase 2: Execution - Only works on APPROVED stories

# Don't exit on error - handle errors explicitly
set +e

# Configuration
MAX_ITERATIONS=${MAX_ITERATIONS:-15}
PROGRESS_LINES=${PROGRESS_LINES:-25}
PRD_SUMMARY_LINES=${PRD_SUMMARY_LINES:-15}

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$RALPH_DIR")"
LOG_FILE="$RALPH_DIR/ralph.log"
OUTPUT_FILE="$RALPH_DIR/output.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }
log_success() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }
log_warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }
log_error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }
log_cyan() { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

check_dependencies() {
    log "Checking dependencies..."

    if ! command -v claude &> /dev/null; then
        log_error "Claude CLI not found"
        exit 1
    fi
    log "  - Claude CLI: OK"

    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Install with: brew install jq (Mac) or apt install jq (Linux)"
        exit 1
    fi
    log "  - jq: OK"

    for f in PRD.md prd.json prompt.md progress.txt; do
        if [ ! -f "$RALPH_DIR/$f" ]; then
            log_error "$f not found in $RALPH_DIR"
            exit 1
        fi
    done
    log "  - Required files: OK"

    # Validate JSON
    if ! jq empty "$RALPH_DIR/prd.json" 2>/dev/null; then
        log_error "prd.json is not valid JSON!"
        log_error "Check for syntax errors (trailing commas, comments, etc.)"
        exit 1
    fi
    log "  - prd.json syntax: OK"
}

# Get first story where approved=true AND done=false
get_active_story() {
    jq -r '
        .stories[] | select(.approved == true and .done == false) |
        "ID: \(.id)\nFeature: \(.feature // "N/A")\nTitle: \(.title)\nPrompt: \(.prompt)\nAcceptance: \(.acceptance_criteria | join(", "))\nFiles to modify: \(.files_to_modify // [] | join(", "))\nFiles to create: \(.files_to_create // [] | join(", "))"
    ' "$RALPH_DIR/prd.json" 2>/dev/null | head -n 20
}

get_active_story_id() {
    jq -r '.stories[] | select(.approved == true and .done == false) | .id' "$RALPH_DIR/prd.json" 2>/dev/null | head -n 1
}

# Count stories: approved but not done
count_remaining() {
    local count
    count=$(jq '[.stories[] | select(.approved == true and .done == false)] | length' "$RALPH_DIR/prd.json" 2>/dev/null)
    echo "${count:-0}"
}

# Count total approved
count_approved() {
    local count
    count=$(jq '[.stories[] | select(.approved == true)] | length' "$RALPH_DIR/prd.json" 2>/dev/null)
    echo "${count:-0}"
}

# Count unapproved
count_unapproved() {
    local count
    count=$(jq '[.stories[] | select(.approved == false or .approved == null)] | length' "$RALPH_DIR/prd.json" 2>/dev/null)
    echo "${count:-0}"
}

build_minimal_prompt() {
    local story_id=$(get_active_story_id)
    local active_story=$(get_active_story)
    local progress_tail=$(tail -n "$PROGRESS_LINES" "$RALPH_DIR/progress.txt" 2>/dev/null)
    local prd_summary=$(head -n "$PRD_SUMMARY_LINES" "$RALPH_DIR/PRD.md" 2>/dev/null)
    local prompt_rules=$(cat "$RALPH_DIR/prompt.md" 2>/dev/null)

    cat << EOF
$prompt_rules

---

## Feature Context (PRD Summary)
$prd_summary

---

## Current Story (#$story_id) [APPROVED]
$active_story

---

## Recent Progress (last $PROGRESS_LINES lines)
$progress_tail

---

NOW: Implement story #$story_id. Be concise. Commit when done. Update prd.json and progress.txt.
EOF
}

run_iteration() {
    local iteration=$1
    local remaining=$(count_remaining)
    local story_id=$(get_active_story_id)

    if [ -z "$story_id" ] || [ "$remaining" -eq 0 ]; then
        log "No more approved stories to process"
        return 0  # No more approved stories
    fi

    log_cyan "=== Iteration $iteration/$MAX_ITERATIONS | Story #$story_id | $remaining approved remaining ==="

    # Build minimal prompt
    local prompt=$(build_minimal_prompt)

    # Count tokens (rough estimate: 4 chars = 1 token)
    local char_count=${#prompt}
    local token_estimate=$((char_count / 4))
    log "Prompt size: ~$token_estimate tokens"

    # Save for debug
    echo "$prompt" > "$RALPH_DIR/last_prompt.txt"

    cd "$PROJECT_DIR"

    log "Calling Claude CLI..."
    if claude --print --dangerously-skip-permissions "$prompt" > "$OUTPUT_FILE" 2>&1; then
        log_success "Claude completed iteration $iteration"
    else
        log_warning "Claude exited with non-zero status"
        log_warning "Check $OUTPUT_FILE for details"
    fi

    # Check completion
    if grep -q "COMPLETE" "$OUTPUT_FILE" 2>/dev/null; then
        return 0
    fi

    return 1
}

main() {
    echo ""
    log_cyan "╔════════════════════════════════════════╗"
    log_cyan "║  Ralph - Execution Phase (Approved)    ║"
    log_cyan "╚════════════════════════════════════════╝"
    log "Project: $PROJECT_DIR"
    log "Max iterations: $MAX_ITERATIONS"
    echo ""

    check_dependencies

    local approved=$(count_approved)
    local remaining=$(count_remaining)
    local unapproved=$(count_unapproved)

    log "Stories status:"
    log "  - Approved & pending: $remaining"
    log "  - Approved & done:    $((approved - remaining))"
    log "  - Not approved:       $unapproved"
    echo ""

    if [ "$approved" -eq 0 ]; then
        log_warning "No approved stories found!"
        log_warning "Run ./ralph-plan.sh first, then set 'approved: true' on stories you want."
        exit 0
    fi

    if [ "$remaining" -eq 0 ]; then
        log_success "All approved stories are complete!"
        exit 0
    fi

    log "Starting execution of $remaining approved stories"
    echo ""

    for ((i=1; i<=MAX_ITERATIONS; i++)); do
        if run_iteration $i; then
            echo ""
            log_success "╔════════════════════════════════════════╗"
            log_success "║    ALL APPROVED STORIES COMPLETE!      ║"
            log_success "╚════════════════════════════════════════╝"
            log_success "Finished in $i iterations"
            exit 0
        fi

        remaining=$(count_remaining)
        if [ "$remaining" -eq 0 ]; then
            log_success "All approved stories done!"
            exit 0
        fi

        sleep 1
    done

    log_warning "Max iterations reached. Remaining approved: $(count_remaining)"
    exit 1
}

trap 'log_warning "Interrupted"; exit 130' INT
main "$@"
