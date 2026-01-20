#!/bin/bash

# Ralph Plan - Product Brain Phase
# Explores codebase and generates feature/story proposals

set -e

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$RALPH_DIR")"
OUTPUT_FILE="$RALPH_DIR/plan_output.md"
DRAFT_FILE="$RALPH_DIR/prd_draft.json"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${CYAN}[Plan]${NC} $1"; }
log_success() { echo -e "${GREEN}[Plan]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[Plan]${NC} $1"; }

check_dependencies() {
    if ! command -v claude &> /dev/null; then
        echo "Claude CLI not found"
        exit 1
    fi
}

build_plan_prompt() {
    local plan_rules=$(cat "$RALPH_DIR/plan_prompt.md")

    cat << EOF
$plan_rules

---

## Project Location
$PROJECT_DIR

## Key Files to Explore
- README.md (if exists)
- CLAUDE.md (project instructions)
- package.json (dependencies)
- app/ directory (routes)
- components/ directory (UI)
- lib/ directory (utilities)
- hooks/ directory (React hooks)

Begin your analysis now. Explore the codebase, identify opportunities, and propose stories.
EOF
}

main() {
    echo ""
    log "╔════════════════════════════════════════╗"
    log "║  Ralph Plan - Product Brain Phase      ║"
    log "╚════════════════════════════════════════╝"
    log "Project: $PROJECT_DIR"
    echo ""

    check_dependencies

    log "Generating planning prompt..."
    local prompt=$(build_plan_prompt)

    # Estimate tokens
    local char_count=${#prompt}
    local token_estimate=$((char_count / 4))
    log "Prompt size: ~$token_estimate tokens"

    # Save prompt for debug
    echo "$prompt" > "$RALPH_DIR/plan_last_prompt.txt"

    log "Launching Claude for codebase analysis..."
    log "(This may take a few minutes)"
    echo ""

    cd "$PROJECT_DIR"

    if claude --print "$prompt" > "$OUTPUT_FILE" 2>&1; then
        log_success "Analysis complete!"
    else
        log_warning "Claude exited with non-zero status"
    fi

    # Try to extract JSON from output
    log "Extracting proposed stories..."

    # Look for JSON block in output
    if grep -q '"stories"' "$OUTPUT_FILE"; then
        # Extract JSON between ```json and ```
        sed -n '/```json/,/```/p' "$OUTPUT_FILE" | sed '1d;$d' > "$DRAFT_FILE" 2>/dev/null || true

        if [ -s "$DRAFT_FILE" ]; then
            log_success "Draft stories saved to: $DRAFT_FILE"
        fi
    fi

    echo ""
    log_success "╔════════════════════════════════════════╗"
    log_success "║         PLANNING COMPLETE              ║"
    log_success "╚════════════════════════════════════════╝"
    echo ""
    log "Output: $OUTPUT_FILE"
    log "Draft:  $DRAFT_FILE"
    echo ""
    log_warning "NEXT STEPS:"
    echo "  1. Review the analysis in plan_output.md"
    echo "  2. Edit prd_draft.json or copy to prd.json"
    echo "  3. Set 'approved: true' on stories you want"
    echo "  4. Run ./ralph.sh to execute approved stories"
    echo ""
}

main "$@"
