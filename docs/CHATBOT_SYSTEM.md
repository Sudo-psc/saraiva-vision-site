# AI Chatbot System Documentation

## Overview

The AI Chatbot system provides intelligent patient triage and FAQ support for Saraiva Vision clinic using OpenAI's GPT-3.5-turbo model with comprehensive medical guardrails.

## Architecture

### Components

1. **API Endpoint** (`/api/chatbot`)
   - Handles chat requests with OpenAI integration
   - Implements medical guardrails and safety measures
   - Manages conversation context and logging

2. **Frontend Widget** (`ChatbotWidget.jsx`)
   - Floating chat interface
   - Real-time messaging with loading states
   - Responsive design with accessibility features

3. **Medical Guardrails** (`chatbotGuardrails.js`)
   - Keyword detection for medical topics
   - Emergency situation identification
   - Response sanitization and safety checks

4. **Logging System** (`chatbotLogger.js`)
   - Anonymized conversation logging
   - LGPD-compliant data handling
   - Analytics and monitoring capabilities

## Features

### Medical Safety
- **No Diagnoses**: Never provides medical diagnoses or clinical advice
- **Emergency Detection**: Identifies urgent situations and directs to immediate care
- **Professional Boundaries**: Maintains appropriate medical-legal boundaries
- **Escalation Paths**: Clear guidance to human contact when needed

### User Experience
- **Floating Interface**: Non-intrusive chat widget
- **Real-time Responses**: Fast API responses with loading indicators
- **Conversation Memory**: Maintains context within sessions
- **Booking Integration**: Suggests appointment scheduling when appropriate

### Technical Features
- **Rate Limiting**: Prevents spam and abuse
- **Error Handling**: Graceful fallbacks and error recovery
- **Responsive Design**: Works on all device sizes
- **Accessibility**: WCAG 2.1 AA compliant interface

## API Usage

### Request Format
```json
{
  "message": "User message text",
  "sessionId": "optional_session_id",
  "conversationHistory": [
    {
      "role": "user|assistant",
      "content": "message content"
    }
  ]
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "response": "Bot response text",
    "sessionId": "session_identifier",
    "suggestsBooking": false,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "isEmergency": false,
    "containsMedicalKeywords": false
  }
}
```

## Configuration

### Environment Variables
```bash
OPENAI_API_KEY=sk-your_openai_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Rate Limiting
- **Default**: 10 requests per minute per IP
- **Configurable**: Adjust in API handler
- **Storage**: In-memory (consider Redis for production)

## Medical Guardrails

### Keyword Detection
The system monitors for medical keywords and responds appropriately:

- **Symptoms**: Pain, redness, vision problems
- **Emergencies**: Sudden vision loss, severe pain, trauma
- **Medications**: Eye drops, treatments, prescriptions

### Response Types

1. **General Information**: Safe, educational content about eye health
2. **Medical Disclaimer**: Added to responses about symptoms
3. **Emergency Response**: Immediate care instructions for urgent situations
4. **Booking Suggestion**: Guidance to schedule appointments

### Example Responses

**Symptom Query**:
> User: "My eye is red and painful"
> 
> Bot: "I understand you're experiencing discomfort. For proper evaluation of eye symptoms, it's important to have an in-person examination..."
> 
> ⚠️ **IMPORTANT**: I cannot provide medical diagnoses through chat. Please schedule a consultation for proper evaluation.

**Emergency Situation**:
> User: "I suddenly lost vision in my right eye"
> 
> Bot: ⚠️ **ATTENTION**: This situation may require IMMEDIATE medical attention.
> 
> 🚨 **SEEK HELP NOW**:
> • Nearest emergency room
> • Call emergency: 192 (SAMU)
> • Contact us: (33) 99860-1427

## Logging and Analytics

### Data Collection
- **Anonymized**: No personal information stored
- **Metrics**: Message length, response time, topic analysis
- **Compliance**: LGPD-compliant data handling

### Analytics Available
- Conversation volume and patterns
- Common topics and questions
- Emergency mention frequency
- User satisfaction indicators
- Peak usage hours

## Testing

### Unit Tests
- API endpoint validation
- Medical guardrail functionality
- Rate limiting behavior
- Error handling scenarios

### Integration Tests
- OpenAI API integration
- Database logging
- Frontend-backend communication
- End-to-end user flows

### Test Coverage
- ✅ Medical safety guardrails
- ✅ Emergency detection
- ✅ Rate limiting
- ✅ Error handling
- ✅ UI interactions
- ✅ Conversation flow

## Deployment

### Vercel Configuration
```json
{
  "functions": {
    "api/chatbot.js": { "maxDuration": 20 }
  }
}
```

### Database Setup
Requires `event_log` table in Supabase for conversation logging.

### Monitoring
- API response times
- Error rates
- OpenAI token usage
- User engagement metrics

## Security Considerations

### Data Privacy
- No PII stored in logs
- IP addresses hashed
- Conversation content sanitized
- LGPD compliance maintained

### API Security
- Rate limiting per IP
- Input validation and sanitization
- Error message sanitization
- Secure environment variable handling

### Medical Safety
- Strict no-diagnosis policy
- Emergency escalation protocols
- Professional boundary maintenance
- Clear limitation statements

## Future Enhancements

### Planned Features
- Multi-language support (Portuguese/English)
- Voice message support
- Integration with appointment system
- Advanced analytics dashboard
- Custom medical knowledge base

### Technical Improvements
- Redis-based rate limiting
- Advanced conversation context
- Sentiment analysis
- Performance optimizations
- Enhanced error recovery

## Support and Maintenance

### Monitoring
- Daily error rate checks
- Weekly usage analytics review
- Monthly medical safety audit
- Quarterly system performance review

### Updates
- Regular medical guideline reviews
- OpenAI model updates
- Security patch applications
- Feature enhancement deployments

## Contact

For technical support or medical guideline updates, contact the development team or Dr. Philipe Saraiva directly.

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Production Ready