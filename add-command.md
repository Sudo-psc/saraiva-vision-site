# 🤖 Command Generator - Automatic .md File Creator

*Generate structured command documentation files from simple descriptions*

## 📝 Usage

**Command**: `add-command <name> "<description>" [options]`

### Basic Usage
```bash
# Generate a new command file
add-command "security-audit" "Run comprehensive security analysis and vulnerability assessment"

# With specific category
add-command "performance-test" "Benchmark application performance and identify bottlenecks" --category "testing"

# With custom template
add-command "database-backup" "Create and verify database backup procedures" --template "operational"
```

## 🎯 Command Templates

### 1. **Technical Analysis** (default)
**Pattern**: Analysis → Implementation → Validation → Documentation
- Status tracking with checkboxes
- Technical details section
- Validation results
- Next steps

### 2. **Quick Reference** 
**Pattern**: Quick Commands → Common Tasks → Patterns → Resources
- Command shortcuts
- Code examples
- File location maps
- Essential links

### 3. **Deployment Checklist**
**Pattern**: Verification → Deployment Steps → Monitoring → Rollback
- Pre-deployment checks
- Step-by-step deployment
- Success criteria
- Emergency procedures

### 4. **Operational Playbook**
**Pattern**: Problem → Solution → Verification → Documentation
- Issue identification
- Resolution steps
- Testing procedures
- Knowledge capture

## 📋 Generated File Structure

### Standard Template
```markdown
# 🎯 [Command Name] - [Brief Description]

*[Detailed description and context]*

## ✅ Status Overview
- [ ] **Phase 1**: [Initial task]
- [ ] **Phase 2**: [Implementation task]  
- [ ] **Phase 3**: [Validation task]
- [ ] **Phase 4**: [Documentation task]

## 🛠️ Implementation Details

### [Component/Area 1]
**Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete
- Implementation notes
- Technical specifications
- Dependencies

### [Component/Area 2]
- Additional implementation details
- Configuration requirements
- Integration points

## 🧪 Validation & Testing

### Testing Checklist
- [ ] **Functional Tests**: Core functionality verified
- [ ] **Performance Tests**: Performance benchmarks met
- [ ] **Security Tests**: Security requirements validated
- [ ] **Integration Tests**: System integration verified

### Success Criteria
- **Metric 1**: Target value
- **Metric 2**: Target value  
- **Quality Gate**: Pass/Fail criteria

## 📊 Results & Evidence

### Measurements
```json
{
  "performance": {
    "metric1": "value",
    "metric2": "value"
  },
  "quality": {
    "score": "value",
    "coverage": "percentage"
  }
}
```

## 🚀 Next Steps

1. **Priority 1**: [Immediate next action]
2. **Priority 2**: [Secondary next action]
3. **Priority 3**: [Future enhancement]

## 📚 References & Resources

- [📖 **Related Documentation**](./link-to-docs.md)
- [🔧 **Technical Specifications**](./link-to-specs.md)
- [📋 **Related Checklists**](./link-to-checklists.md)

---

**Generated**: [timestamp]
**Command**: `add-command [name] "[description]"`
**Template**: [template-type]
```

## ⚙️ Generator Options

### `--category [type]`
- `analysis` - Technical analysis and investigation
- `testing` - Quality assurance and testing procedures
- `deployment` - Deployment and operational procedures  
- `reference` - Quick reference and documentation
- `security` - Security-focused procedures
- `performance` - Performance optimization tasks

### `--template [style]`
- `technical` - Detailed technical analysis (default)
- `quick-ref` - Quick reference format
- `checklist` - Step-by-step checklist format
- `operational` - Operations playbook format
- `security` - Security audit format

### `--priority [level]`
- `critical` - Critical system operations
- `high` - Important features and fixes
- `medium` - Standard improvements (default)
- `low` - Nice-to-have enhancements

### `--format [output]`
- `full` - Complete template with all sections (default)
- `minimal` - Essential sections only
- `custom` - Interactive section selection

## 🎨 Customization Examples

### Security Audit Command
```bash
add-command "security-audit" "Comprehensive security assessment and vulnerability analysis" \
  --category security \
  --template security \
  --priority critical
```

**Generates**: Focus on threat analysis, vulnerability assessment, compliance checks

### Performance Benchmark
```bash
add-command "performance-benchmark" "Application performance analysis and optimization" \
  --category testing \
  --template technical \
  --priority high
```

**Generates**: Performance metrics, optimization targets, benchmarking procedures

### Quick Reference Guide  
```bash
add-command "api-reference" "Quick API endpoint reference and usage examples" \
  --category reference \
  --template quick-ref \
  --format minimal
```

**Generates**: Compact command reference, usage patterns, common examples

## 🔧 Implementation Commands

### Generate Basic Analysis Command
```bash
# Creates: analysis-command.md
add-command "analysis-command" "System analysis and investigation procedures"
```

### Generate Testing Playbook
```bash  
# Creates: testing-playbook.md
add-command "testing-playbook" "Comprehensive testing strategy and execution" \
  --category testing \
  --template checklist
```

### Generate Security Procedure
```bash
# Creates: security-procedure.md  
add-command "security-procedure" "Security hardening and compliance verification" \
  --category security \
  --priority critical
```

## 📁 Generated File Locations

### Standard Location
```
/home/saraiva-vision-site/[command-name].md
```

### Organized by Category
```
/home/saraiva-vision-site/
├── docs/
│   ├── analysis/[command-name].md
│   ├── testing/[command-name].md
│   ├── security/[command-name].md
│   └── reference/[command-name].md
```

## 🎯 Community Examples

### Frontend Development
```bash
add-command "component-audit" "React component analysis and optimization"
add-command "ui-testing" "User interface testing and validation procedures"
add-command "accessibility-check" "WCAG compliance and accessibility verification"
```

### Backend Operations
```bash  
add-command "api-health" "API endpoint health monitoring and diagnostics"
add-command "database-optimize" "Database performance optimization procedures"
add-command "deployment-verify" "Production deployment verification checklist"
```

### DevOps & Infrastructure
```bash
add-command "server-health" "Server monitoring and maintenance procedures"
add-command "backup-verify" "Backup system verification and recovery testing"  
add-command "security-scan" "Infrastructure security scanning and hardening"
```

## 📋 Integration with Existing Workflow

### AutoCommit Integration
```bash
# Generate command and commit automatically
add-command "new-feature" "Feature implementation checklist" --autocommit

# Generates file and creates git commit:
# "docs: add new-feature command documentation"
```

### Claude Code Integration  
```bash
# Generate and immediately use with Claude
add-command "code-review" "Code quality review and analysis" --use-now

# Creates file and executes: /code-review
```

## 🚀 Advanced Usage

### Batch Generation
```bash
# Generate multiple related commands
add-command-batch security-audit database-backup server-monitor \
  --category operational \
  --template checklist
```

### Interactive Mode
```bash
# Interactive command creation
add-command --interactive

# Prompts for:
# - Command name
# - Description  
# - Category selection
# - Template choice
# - Priority level
# - Custom sections
```

### Template Inheritance
```bash
# Create command based on existing template
add-command "new-security-check" "Custom security verification" \
  --inherit-from "./security-audit.md" \
  --modify sections
```

## 📊 Command Usage Analytics

### Generated Commands Tracking
```json
{
  "total_commands": 47,
  "by_category": {
    "analysis": 12,
    "testing": 8, 
    "security": 6,
    "deployment": 10,
    "reference": 11
  },
  "most_used_template": "technical",
  "success_rate": "94%"
}
```

## 🔗 Related Commands

- [📋 **Project Index**](./PROJECT_DOCUMENTATION_INDEX.md) - All project documentation
- [🚀 **Quick Reference**](./DEVELOPER_QUICK_REFERENCE.md) - Developer shortcuts
- [🛡️ **Security Playbook**](./SECURITY_ROTATION_PLAYBOOK.md) - Security procedures
- [📊 **Testing Guide**](./TEST_REPORT.md) - Testing documentation

---

## ⚡ Quick Start

```bash
# 1. Generate your first command
add-command "my-analysis" "Custom analysis procedure"

# 2. Edit the generated file to match your needs
nano ./my-analysis.md

# 3. Use the command in your workflow
/my-analysis

# 4. Iterate and improve based on results
```

**Ready to generate structured command documentation that follows established patterns and integrates seamlessly with your development workflow.**

---

**Last Updated**: 2025-01-09
**Command Generator Version**: 1.0
**Template Compatibility**: All current .md patterns