#!/usr/bin/env node

/**
 * Integration Testing and Quality Assurance Test Runner
 * Executes comprehensive system integration tests and compliance validation
 * Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.4, 8.1, 8.3
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntegrationTestRunner {
    constructor() {
        this.testResults = {
            systemIntegration: null,
            medicalReferral: null,
            lgpdPrivacy: null,
            cfmCompliance: null,
            lgpdPrivacyImpact: null,
            securityPenetration: null
        };
        this.startTime = new Date();
    }

    async runAllTests() {
        console.log('🚀 Starting Integration Testing and Quality Assurance Suite');
        console.log('='.repeat(80));

        try {
            // Run system integration tests
            await this.runSystemIntegrationTests();

            // Run medical referral integration tests
            await this.runMedicalReferralTests();

            // Run LGPD privacy integration tests
            await this.runLGPDPrivacyTests();

            // Run CFM compliance audit tests
            await this.runCFMComplianceTests();

            // Run LGPD privacy impact assessment
            await this.runLGPDPrivacyImpactAssessment();

            // Run security penetration tests
            await this.runSecurityPenetrationTests();

            // Generate comprehensive report
            await this.generateComprehensiveReport();

        } catch (error) {
            console.error('❌ Test suite execution failed:', error.message);
            process.exit(1);
        }
    }

    async runSystemIntegrationTests() {
        console.log('\n📋 Running System Integration Tests...');
        console.log('-'.repeat(50));

        try {
            const result = execSync(
                'npm run test -- src/test/__tests__/chatbot-system-integration.test.js --run --reporter=verbose',
                { encoding: 'utf8', stdio: 'pipe' }
            );

            this.testResults.systemIntegration = {
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
            };

            console.log('✅ System Integration Tests: PASSED');
            console.log('   - Complete chatbot workflow with appointment booking: ✓');
            console.log('   - Medical referral system validation: ✓');
            console.log('   - LGPD privacy features testing: ✓');
            console.log('   - End-to-end integration scenarios: ✓');

        } catch (error) {
            this.testResults.systemIntegration = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log('❌ System Integration Tests: FAILED');
            console.log('   Error:', error.message);
            throw error;
        }
    }

    async runMedicalReferralTests() {
        console.log('\n🏥 Running Medical Referral Integration Tests...');
        console.log('-'.repeat(50));

        try {
            const result = execSync(
                'npm run test -- src/test/__tests__/medical-referral-integration.test.js --run --reporter=verbose',
                { encoding: 'utf8', stdio: 'pipe' }
            );

            this.testResults.medicalReferral = {
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
            };

            console.log('✅ Medical Referral Integration Tests: PASSED');
            console.log('   - CFM compliance in referral process: ✓');
            console.log('   - Referral documentation and tracking: ✓');
            console.log('   - Medical ethics and safety compliance: ✓');
            console.log('   - Audit trail and compliance logging: ✓');

        } catch (error) {
            this.testResults.medicalReferral = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log('❌ Medical Referral Integration Tests: FAILED');
            console.log('   Error:', error.message);
            throw error;
        }
    }

    async runLGPDPrivacyTests() {
        console.log('\n🔒 Running LGPD Privacy Integration Tests...');
        console.log('-'.repeat(50));

        try {
            const result = execSync(
                'npm run test -- src/test/__tests__/lgpd-privacy-integration.test.js --run --reporter=verbose',
                { encoding: 'utf8', stdio: 'pipe' }
            );

            this.testResults.lgpdPrivacy = {
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
            };

            console.log('✅ LGPD Privacy Integration Tests: PASSED');
            console.log('   - Consent management workflow: ✓');
            console.log('   - Data subject rights implementation: ✓');
            console.log('   - Data encryption and security: ✓');
            console.log('   - Cross-border data transfer restrictions: ✓');
            console.log('   - Audit and compliance monitoring: ✓');

        } catch (error) {
            this.testResults.lgpdPrivacy = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log('❌ LGPD Privacy Integration Tests: FAILED');
            console.log('   Error:', error.message);
            throw error;
        }
    }

    async runCFMComplianceTests() {
        console.log('\n⚕️ Running CFM Compliance Audit Tests...');
        console.log('-'.repeat(50));

        try {
            const result = execSync(
                'npm run test -- src/test/__tests__/cfm-compliance-audit.test.js --run --reporter=verbose',
                { encoding: 'utf8', stdio: 'pipe' }
            );

            this.testResults.cfmCompliance = {
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
            };

            console.log('✅ CFM Compliance Audit Tests: PASSED');
            console.log('   - Medical ethics compliance: ✓');
            console.log('   - Emergency detection and response: ✓');
            console.log('   - Medical record compliance: ✓');
            console.log('   - Professional responsibility compliance: ✓');
            console.log('   - Audit trail and documentation: ✓');
            console.log('   - Continuous compliance monitoring: ✓');

        } catch (error) {
            this.testResults.cfmCompliance = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log('❌ CFM Compliance Audit Tests: FAILED');
            console.log('   Error:', error.message);
            throw error;
        }
    }

    async runLGPDPrivacyImpactAssessment() {
        console.log('\n📊 Running LGPD Privacy Impact Assessment...');
        console.log('-'.repeat(50));

        try {
            const result = execSync(
                'npm run test -- src/test/__tests__/lgpd-privacy-impact-assessment.test.js --run --reporter=verbose',
                { encoding: 'utf8', stdio: 'pipe' }
            );

            this.testResults.lgpdPrivacyImpact = {
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
            };

            console.log('✅ LGPD Privacy Impact Assessment: PASSED');
            console.log('   - Privacy impact assessment execution: ✓');
            console.log('   - Data subject rights assessment: ✓');
            console.log('   - Consent management assessment: ✓');
            console.log('   - Data security assessment: ✓');
            console.log('   - Data retention and deletion assessment: ✓');
            console.log('   - Comprehensive privacy compliance report: ✓');

        } catch (error) {
            this.testResults.lgpdPrivacyImpact = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log('❌ LGPD Privacy Impact Assessment: FAILED');
            console.log('   Error:', error.message);
            throw error;
        }
    }

    async runSecurityPenetrationTests() {
        console.log('\n🛡️ Running Security Penetration Tests...');
        console.log('-'.repeat(50));

        try {
            const result = execSync(
                'npm run test -- src/test/__tests__/security-penetration-testing.test.js --run --reporter=verbose',
                { encoding: 'utf8', stdio: 'pipe' }
            );

            this.testResults.securityPenetration = {
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
            };

            console.log('✅ Security Penetration Tests: PASSED');
            console.log('   - Input validation and injection prevention: ✓');
            console.log('   - Authentication and authorization testing: ✓');
            console.log('   - Data encryption and protection testing: ✓');
            console.log('   - Rate limiting and DDoS protection: ✓');
            console.log('   - Security monitoring and incident response: ✓');
            console.log('   - Comprehensive security assessment: ✓');

        } catch (error) {
            this.testResults.securityPenetration = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log('❌ Security Penetration Tests: FAILED');
            console.log('   Error:', error.message);
            throw error;
        }
    }

    async generateComprehensiveReport() {
        console.log('\n📄 Generating Comprehensive Test Report...');
        console.log('-'.repeat(50));

        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000);

        const report = {
            testSuite: 'Integration Testing and Quality Assurance',
            executionDate: this.startTime.toISOString(),
            duration: `${duration} seconds`,
            results: this.testResults,
            summary: this.generateSummary(),
            complianceStatus: this.generateComplianceStatus(),
            recommendations: this.generateRecommendations()
        };

        // Save report to file
        const reportPath = path.join(__dirname, '..', 'test-reports', 'integration-compliance-report.json');
        const reportDir = path.dirname(reportPath);

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate markdown report
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(reportDir, 'integration-compliance-report.md');
        fs.writeFileSync(markdownPath, markdownReport);

        console.log('✅ Comprehensive test report generated');
        console.log(`   JSON Report: ${reportPath}`);
        console.log(`   Markdown Report: ${markdownPath}`);

        // Display summary
        this.displaySummary(report.summary);
    }

    generateSummary() {
        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(result => result.status === 'passed').length;
        const failedTests = totalTests - passedTests;

        return {
            totalTestSuites: totalTests,
            passedTestSuites: passedTests,
            failedTestSuites: failedTests,
            successRate: Math.round((passedTests / totalTests) * 100),
            overallStatus: failedTests === 0 ? 'PASSED' : 'FAILED'
        };
    }

    generateComplianceStatus() {
        const cfmCompliant = this.testResults.cfmCompliance?.status === 'passed';
        const lgpdCompliant = this.testResults.lgpdPrivacy?.status === 'passed' &&
            this.testResults.lgpdPrivacyImpact?.status === 'passed';
        const securityCompliant = this.testResults.securityPenetration?.status === 'passed';
        const integrationCompliant = this.testResults.systemIntegration?.status === 'passed' &&
            this.testResults.medicalReferral?.status === 'passed';

        return {
            cfmCompliance: cfmCompliant,
            lgpdCompliance: lgpdCompliant,
            securityCompliance: securityCompliant,
            integrationCompliance: integrationCompliant,
            overallCompliance: cfmCompliant && lgpdCompliant && securityCompliant && integrationCompliant
        };
    }

    generateRecommendations() {
        const recommendations = [];

        Object.entries(this.testResults).forEach(([testSuite, result]) => {
            if (result.status === 'failed') {
                recommendations.push({
                    area: testSuite,
                    priority: 'high',
                    action: `Review and fix issues in ${testSuite} test suite`,
                    description: `The ${testSuite} test suite failed and requires immediate attention to ensure compliance and functionality.`
                });
            }
        });

        if (recommendations.length === 0) {
            recommendations.push({
                area: 'maintenance',
                priority: 'low',
                action: 'Continue regular testing and monitoring',
                description: 'All tests passed successfully. Maintain current testing schedule and monitor for any changes.'
            });
        }

        return recommendations;
    }

    generateMarkdownReport(report) {
        return `# Integration Testing and Quality Assurance Report

## Executive Summary

- **Execution Date**: ${report.executionDate}
- **Duration**: ${report.duration}
- **Overall Status**: ${report.summary.overallStatus}
- **Success Rate**: ${report.summary.successRate}%

## Test Results Summary

| Test Suite | Status | Timestamp |
|------------|--------|-----------|
| System Integration | ${this.testResults.systemIntegration?.status || 'N/A'} | ${this.testResults.systemIntegration?.timestamp || 'N/A'} |
| Medical Referral | ${this.testResults.medicalReferral?.status || 'N/A'} | ${this.testResults.medicalReferral?.timestamp || 'N/A'} |
| LGPD Privacy | ${this.testResults.lgpdPrivacy?.status || 'N/A'} | ${this.testResults.lgpdPrivacy?.timestamp || 'N/A'} |
| CFM Compliance | ${this.testResults.cfmCompliance?.status || 'N/A'} | ${this.testResults.cfmCompliance?.timestamp || 'N/A'} |
| LGPD Privacy Impact | ${this.testResults.lgpdPrivacyImpact?.status || 'N/A'} | ${this.testResults.lgpdPrivacyImpact?.timestamp || 'N/A'} |
| Security Penetration | ${this.testResults.securityPenetration?.status || 'N/A'} | ${this.testResults.securityPenetration?.timestamp || 'N/A'} |

## Compliance Status

- **CFM Compliance**: ${report.complianceStatus.cfmCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **LGPD Compliance**: ${report.complianceStatus.lgpdCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Security Compliance**: ${report.complianceStatus.securityCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Integration Compliance**: ${report.complianceStatus.integrationCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.area} (Priority: ${rec.priority})
- **Action**: ${rec.action}
- **Description**: ${rec.description}
`).join('\n')}

## Detailed Results

${Object.entries(this.testResults).map(([suite, result]) => `
### ${suite}
- **Status**: ${result.status}
- **Timestamp**: ${result.timestamp}
${result.error ? `- **Error**: ${result.error}` : ''}
`).join('\n')}

---
*Report generated on ${new Date().toISOString()}*
`;
    }

    displaySummary(summary) {
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST EXECUTION SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total Test Suites: ${summary.totalTestSuites}`);
        console.log(`Passed: ${summary.passedTestSuites}`);
        console.log(`Failed: ${summary.failedTestSuites}`);
        console.log(`Success Rate: ${summary.successRate}%`);
        console.log(`Overall Status: ${summary.overallStatus}`);
        console.log('='.repeat(80));

        if (summary.overallStatus === 'PASSED') {
            console.log('🎉 All integration and compliance tests passed successfully!');
            console.log('✅ The AI Chatbot Widget is ready for deployment.');
        } else {
            console.log('⚠️  Some tests failed. Please review the detailed report.');
            console.log('❌ Address all issues before proceeding with deployment.');
        }
    }
}

// Execute the test runner
const runner = new IntegrationTestRunner();
runner.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});

export default IntegrationTestRunner;