# Contact.jsx Refactoring Plan
**Date**: 2025-09-29
**Current Status**: 1229 lines monolithic component
**Target**: <300 lines per module with clear separation of concerns

## 🎯 Refactoring Strategy

### Phase 1: Extract Custom Hooks (Semana 1)
**Target**: Move business logic to reusable hooks

#### 1.1 `useContactForm.js` (~150 lines)
**Responsibility**: Form state management and validation
```javascript
export function useContactForm() {
  const [formData, setFormData] = useState({...})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateFieldRealTime = (fieldName, value) => {/*...*/}
  const handleChange = (e) => {/*...*/}
  const handleBlur = (e) => {/*...*/}

  return {
    formData,
    errors,
    touched,
    fieldValidation,
    handleChange,
    handleBlur,
    validateField: validateFieldRealTime
  }
}
```

#### 1.2 `useContactSubmission.js` (~200 lines)
**Responsibility**: Form submission logic with retry and fallback
```javascript
export function useContactSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleSubmit = async (formData, recaptchaToken) => {/*...*/}
  const handleRetry = async () => {/*...*/}

  return {
    isSubmitting,
    submissionError,
    retryCount,
    handleSubmit,
    handleRetry,
    showAlternativeContacts
  }
}
```

#### 1.3 `useFormAccessibility.js` (~100 lines)
**Responsibility**: Accessibility features (screen reader announcements, focus management)
```javascript
export function useFormAccessibility() {
  const liveRegionRef = useRef(null)
  const errorSummaryRef = useRef(null)

  const announceToScreenReader = (message, priority) => {/*...*/}
  const focusFirstError = () => {/*...*/}

  return {
    liveRegionRef,
    errorSummaryRef,
    announceToScreenReader,
    focusFirstError
  }
}
```

### Phase 2: Extract UI Components (Semana 2)
**Target**: Separate presentation from logic

#### 2.1 `ContactForm.jsx` (~150 lines)
**Responsibility**: Main form structure and orchestration
```jsx
export function ContactForm() {
  const form = useContactForm()
  const submission = useContactSubmission()
  const a11y = useFormAccessibility()

  return (
    <form onSubmit={submission.handleSubmit}>
      <FormFields {...form} />
      <SubmitButton {...submission} />
      {submission.submissionError && <ErrorDisplay error={submission.submissionError} />}
    </form>
  )
}
```

#### 2.2 `ContactFormFields.jsx` (~200 lines)
**Responsibility**: Form input fields with validation
```jsx
export function ContactFormFields({ formData, errors, touched, onChange, onBlur }) {
  return (
    <>
      <NameInput />
      <EmailInput />
      <PhoneInput />
      <MessageTextarea />
      <ConsentCheckbox />
      <HoneypotField />
    </>
  )
}
```

#### 2.3 `ContactInfo.jsx` (~100 lines)
**Responsibility**: Contact information display (address, phone, hours)
```jsx
export function ContactInfo() {
  return (
    <div className="space-y-6">
      <AddressSection />
      <PhoneSection />
      <EmailSection />
      <BusinessHoursSection />
    </div>
  )
}
```

#### 2.4 `AlternativeContactMethods.jsx` (~80 lines)
**Responsibility**: WhatsApp, chatbot fallback options
```jsx
export function AlternativeContactMethods({ show }) {
  if (!show) return null

  return (
    <div className="space-y-4">
      <WhatsAppButton />
      <ChatbotButton />
      <PhoneCallButton />
    </div>
  )
}
```

#### 2.5 `ErrorDisplay.jsx` (~100 lines)
**Responsibility**: Error message presentation and recovery steps
```jsx
export function ErrorDisplay({ error, onRetry }) {
  const errorType = identifyErrorType(error)
  const recoverySteps = getRecoverySteps(errorType)

  return (
    <div role="alert" className="error-container">
      <ErrorIcon type={errorType} />
      <ErrorMessage error={error} />
      <RecoverySteps steps={recoverySteps} />
      <RetryButton onRetry={onRetry} />
    </div>
  )
}
```

### Phase 3: Extract Smaller UI Primitives (Semana 2)
**Target**: Reusable input components

#### 3.1 `FormInput.jsx` (~50 lines)
```jsx
export function FormInput({ name, label, type, value, error, touched, onChange, onBlur, ...props }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={touched && error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {touched && error && <FieldError id={`${name}-error`} message={error} />}
    </div>
  )
}
```

#### 3.2 `FormTextarea.jsx` (~50 lines)
#### 3.3 `FormCheckbox.jsx` (~50 lines)
#### 3.4 `SubmitButton.jsx` (~40 lines)
#### 3.5 `FieldError.jsx` (~30 lines)

### Phase 4: Final Structure (Após Refatoração)

```
src/components/contact/
├── Contact.jsx (main orchestrator, ~150 lines)
├── ContactForm.jsx (~150 lines)
├── ContactFormFields.jsx (~200 lines)
├── ContactInfo.jsx (~100 lines)
├── AlternativeContactMethods.jsx (~80 lines)
├── ErrorDisplay.jsx (~100 lines)
└── ui/
    ├── FormInput.jsx (~50 lines)
    ├── FormTextarea.jsx (~50 lines)
    ├── FormCheckbox.jsx (~50 lines)
    ├── SubmitButton.jsx (~40 lines)
    └── FieldError.jsx (~30 lines)

src/hooks/
├── useContactForm.js (~150 lines)
├── useContactSubmission.js (~200 lines)
└── useFormAccessibility.js (~100 lines)
```

**Total Lines**: ~1500 lines (distributed)
**Max Component Size**: 200 lines
**Reusability**: High (form primitives can be used elsewhere)

## 📊 Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Largest Component | 1229 lines | 200 lines | 84% reduction |
| Files Count | 1 file | 11 files | Better organization |
| Testability | Low (monolithic) | High (unit testable) | +++  |
| Reusability | None | High (hooks + primitives) | +++ |
| Maintainability | Low | High | +++ |

## 🎯 Implementation Order

### Sprint 1 (Week 1)
1. Extract `useContactForm` hook
2. Extract `useContactSubmission` hook
3. Extract `useFormAccessibility` hook
4. Write unit tests for hooks

### Sprint 2 (Week 2)
5. Create `ContactFormFields` component
6. Create `ErrorDisplay` component
7. Create `AlternativeContactMethods` component
8. Create form UI primitives
9. Refactor main `Contact.jsx` to use new structure
10. Integration tests

### Sprint 3 (Week 3)
11. Code review and adjustments
12. Performance testing
13. A11y audit
14. Documentation

## 🧪 Testing Strategy

### Unit Tests (Hooks)
```javascript
describe('useContactForm', () => {
  it('validates email format', () => {/*...*/})
  it('validates phone format', () => {/*...*/})
  it('handles consent checkbox', () => {/*...*/})
})

describe('useContactSubmission', () => {
  it('submits form successfully', () => {/*...*/})
  it('retries on network failure', () => {/*...*/})
  it('shows alternative contacts after max retries', () => {/*...*/})
})
```

### Integration Tests (Components)
```javascript
describe('ContactForm', () => {
  it('displays validation errors on blur', () => {/*...*/})
  it('submits form with valid data', () => {/*...*/})
  it('announces errors to screen readers', () => {/*...*/})
})
```

## 📝 Notes

- **Backward Compatibility**: Maintain same API for parent components
- **Accessibility**: Preserve all ARIA attributes and screen reader announcements
- **Analytics**: Keep all tracking events intact
- **Error Handling**: Maintain 5-tier fallback system
- **LGPD Compliance**: Keep consent validation logic

---

**Next Actions**:
1. Review and approve this plan
2. Create feature branch: `refactor/contact-form`
3. Start with Phase 1 (hooks extraction)