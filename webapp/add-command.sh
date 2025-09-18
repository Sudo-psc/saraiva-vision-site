#!/bin/bash

# Command Generator Script
# Usage: ./add-command.sh "command-name" "description" [category] [priority]

set -e

# Default values
COMMAND_NAME="$1"
DESCRIPTION="$2"
CATEGORY="${3:-analysis}"
PRIORITY="${4:-medium}"
TEMPLATE_TYPE="technical"

# Validate inputs
if [ -z "$COMMAND_NAME" ] || [ -z "$DESCRIPTION" ]; then
    echo "Usage: ./add-command.sh \"command-name\" \"description\" [category] [priority]"
    echo "Example: ./add-command.sh \"security-audit\" \"Comprehensive security analysis\" \"security\" \"critical\""
    exit 1
fi

# Generate filename
FILENAME="${COMMAND_NAME}.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Determine emoji based on category
case $CATEGORY in
    "security") EMOJI="🛡️" ;;
    "performance") EMOJI="⚡" ;;
    "testing") EMOJI="🧪" ;;
    "deployment") EMOJI="🚀" ;;
    "reference") EMOJI="📚" ;;
    "analysis") EMOJI="🔍" ;;
    *) EMOJI="🎯" ;;
esac

# Create the markdown file
cat > "$FILENAME" << EOF
# $EMOJI $COMMAND_NAME - ${DESCRIPTION^}

*${DESCRIPTION} with systematic approach and validation*

## ✅ Status Overview
- [ ] **Phase 1**: Initial analysis and requirements gathering
- [ ] **Phase 2**: Implementation and development
- [ ] **Phase 3**: Testing and validation
- [ ] **Phase 4**: Documentation and deployment

## 🛠️ Implementation Details

### Primary Component
**Status**: ⏳ Pending
- Implementation specifications
- Technical requirements
- Dependencies and prerequisites
- Configuration parameters

### Secondary Components
**Status**: ⏳ Pending
- Supporting functionality
- Integration requirements
- External dependencies
- Performance considerations

## 🧪 Validation & Testing

### Testing Checklist
- [ ] **Functional Tests**: Core functionality verified
- [ ] **Performance Tests**: Performance benchmarks met
- [ ] **Security Tests**: Security requirements validated
- [ ] **Integration Tests**: System integration verified

### Success Criteria
- **Quality Gate 1**: Functional requirements met
- **Quality Gate 2**: Performance targets achieved
- **Quality Gate 3**: Security standards compliance
- **Quality Gate 4**: Documentation complete

## 📊 Results & Evidence

### Metrics Collection
\`\`\`json
{
  "implementation": {
    "status": "pending",
    "progress": "0%",
    "completion_date": null
  },
  "quality": {
    "test_coverage": "0%",
    "performance_score": 0,
    "security_score": 0
  },
  "validation": {
    "functional_tests": "pending",
    "integration_tests": "pending",
    "user_acceptance": "pending"
  }
}
\`\`\`

### Evidence Documentation
- **Implementation Evidence**: Code changes, configuration updates
- **Testing Evidence**: Test results, coverage reports, performance metrics
- **Validation Evidence**: User acceptance, stakeholder approval
- **Compliance Evidence**: Security scans, accessibility audits

## 🚀 Next Steps

1. **Priority 1**: Begin initial analysis and planning phase
2. **Priority 2**: Implement core functionality with proper testing
3. **Priority 3**: Validate implementation and gather evidence
4. **Priority 4**: Document results and prepare for deployment

## 📚 References & Resources

- [📖 **Project Documentation**](./PROJECT_DOCUMENTATION_INDEX.md) - Complete project docs
- [🚀 **Quick Reference**](./DEVELOPER_QUICK_REFERENCE.md) - Developer shortcuts
- [🔧 **Technical Standards**](./CLAUDE.md) - Development guidelines
- [📋 **Related Commands**](./add-command.md) - Command generator documentation

---

**Generated**: $TIMESTAMP
**Command**: \`./add-command.sh "$COMMAND_NAME" "$DESCRIPTION" "$CATEGORY" "$PRIORITY"\`
**Template**: $TEMPLATE_TYPE
**Category**: $CATEGORY
**Priority**: $PRIORITY
EOF

echo "✅ Generated: $FILENAME"
echo "📝 Description: $DESCRIPTION"
echo "🏷️ Category: $CATEGORY"
echo "⭐ Priority: $PRIORITY"
echo ""
echo "📖 To edit: nano $FILENAME"
echo "🚀 To use: Open the file and follow the structured workflow"