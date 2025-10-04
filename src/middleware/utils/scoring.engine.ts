import { PersonaType, PERSONAS, PersonaConfig, ScoringRule } from '../config/personas.config';

export interface DeviceInfo {
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
}

export interface TrafficSource {
  referrer: string;
  campaign?: string;
  source: string;
  medium?: string;
}

export interface InteractionEvent {
  type: 'click' | 'scroll' | 'time';
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface BehavioralData {
  pagesVisited: string[];
  timeOnPages: Record<string, number>;
  interactions: InteractionEvent[];
  deviceInfo: DeviceInfo;
  trafficSource: TrafficSource;
}

export class PersonaScorer {
  private scores: Map<PersonaType, number> = new Map();
  
  constructor(private data: BehavioralData) {
    this.initializeScores();
  }
  
  private initializeScores() {
    Object.values(PersonaType).forEach(persona => {
      this.scores.set(persona, 0);
    });
  }
  
  public calculateScores(): Map<PersonaType, number> {
    Object.entries(PERSONAS).forEach(([personaId, config]) => {
      const score = this.scorePersona(config);
      this.scores.set(personaId as PersonaType, score);
    });
    
    return this.scores;
  }
  
  private scorePersona(config: PersonaConfig): number {
    let totalScore = 0;
    
    config.scoringRules.forEach(rule => {
      totalScore += this.evaluateRule(rule);
    });
    
    return totalScore;
  }
  
  private evaluateRule(rule: ScoringRule): number {
    switch (rule.trigger) {
      case 'visit_page':
        return this.scorePageVisits(rule);
      case 'device_type':
        return this.scoreDeviceType(rule);
      case 'time_on_page':
        return this.scoreTimeOnPage(rule);
      case 'scroll_depth':
        return this.scoreScrollDepth(rule);
      case 'font_size_preference':
        return this.scoreFontPreference(rule);
      case 'scroll_speed':
        return this.scoreScrollSpeed(rule);
      default:
        return 0;
    }
  }
  
  private scorePageVisits(rule: ScoringRule): number {
    if (!rule.pattern) return 0;
    
    const pattern = rule.pattern instanceof RegExp 
      ? rule.pattern 
      : new RegExp(rule.pattern);
    
    const matchingPages = this.data.pagesVisited.filter(page =>
      pattern.test(page)
    );
    
    return matchingPages.length * rule.weight;
  }
  
  private scoreDeviceType(rule: ScoringRule): number {
    if (!rule.pattern) return 0;
    
    const matches = rule.pattern === this.data.deviceInfo.type;
    return matches ? rule.weight : 0;
  }
  
  private scoreTimeOnPage(rule: ScoringRule): number {
    if (!rule.threshold) return 0;
    
    const avgTime = Object.values(this.data.timeOnPages).reduce((a, b) => a + b, 0) / 
                   Math.max(Object.values(this.data.timeOnPages).length, 1);
    
    const { min = 0, max = Infinity } = rule.threshold;
    
    if (avgTime >= min && avgTime <= max) {
      return rule.weight;
    }
    
    return 0;
  }
  
  private scoreScrollDepth(rule: ScoringRule): number {
    const scrollEvents = this.data.interactions.filter(e => e.type === 'scroll');
    
    if (scrollEvents.length === 0) return 0;
    
    const avgDepth = scrollEvents.reduce((sum, e) => sum + (e.payload.depth as number || 0), 0) / 
                    scrollEvents.length;
    
    if (!rule.threshold) return 0;
    
    const { min = 0, max = Infinity } = rule.threshold;
    
    if (avgDepth >= min && avgDepth <= max) {
      return rule.weight;
    }
    
    return 0;
  }
  
  private scoreFontPreference(_rule: ScoringRule): number {
    return 0;
  }
  
  private scoreScrollSpeed(_rule: ScoringRule): number {
    return 0;
  }
  
  public static getTopPersona(storedData?: string): PersonaType {
    if (storedData && Object.values(PersonaType).includes(storedData as PersonaType)) {
      return storedData as PersonaType;
    }
    
    return PersonaType.DEFAULT;
  }
  
  public getTopPersona(): PersonaType {
    const scores = this.calculateScores();
    
    let topPersona: PersonaType = PersonaType.DEFAULT;
    let maxScore = 0;
    
    scores.forEach((score, persona) => {
      if (score > maxScore && persona !== PersonaType.DEFAULT) {
        maxScore = score;
        topPersona = persona;
      }
    });
    
    return maxScore > 0 ? topPersona : PersonaType.DEFAULT;
  }
  
  public getConfidence(): number {
    const scores = this.calculateScores();
    const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
    
    if (totalScore === 0) return 0;
    
    const topScore = Math.max(...Array.from(scores.values()));
    return topScore / totalScore;
  }
}
