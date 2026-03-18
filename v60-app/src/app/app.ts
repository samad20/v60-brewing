import { Component, signal, computed, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

type BrewType = 'hot' | 'cold';
type FlavorProfile = 'fruity-floral' | 'classic-bold';
type ProcessingMethod = 'washed' | 'natural' | 'anaerobic' | 'infused' | 'natural-honey';
type OriginAltitude = 'high' | 'medium' | 'low' | 'all';

interface ProcessingOption {
  value: ProcessingMethod;
  label: string;
  icon: string;
}

interface OriginOption {
  value: OriginAltitude;
  label: string;
  description: string;
  icon: string;
}

interface TempResult {
  min: number;
  max: number;
  note: string;
}

const PROCESSING_OPTIONS: Record<FlavorProfile, ProcessingOption[]> = {
  'fruity-floral': [
    { value: 'washed', label: 'Washed', icon: 'water_drop' },
    { value: 'natural', label: 'Natural', icon: 'grass' },
    { value: 'anaerobic', label: 'Anaerobic / Carbonic', icon: 'science' },
    { value: 'infused', label: 'Infused / Co-fermented', icon: 'biotech' },
  ],
  'classic-bold': [
    { value: 'natural-honey', label: 'Natural / Honey', icon: 'spa' },
    { value: 'washed', label: 'Washed', icon: 'water_drop' },
  ],
};

const ORIGIN_OPTIONS: Record<string, OriginOption[]> = {
  'fruity-floral|washed': [
    { value: 'high', label: 'High Altitude', description: 'e.g., Ethiopia, Kenya', icon: 'terrain' },
  ],
  'fruity-floral|natural': [
    { value: 'high', label: 'High Altitude', description: 'e.g., Ethiopia, Colombia', icon: 'terrain' },
  ],
  'fruity-floral|anaerobic': [
    { value: 'all', label: 'All Origins', description: 'Any origin works', icon: 'public' },
  ],
  'fruity-floral|infused': [
    { value: 'all', label: 'All Origins', description: 'Any origin works', icon: 'public' },
  ],
  'classic-bold|natural-honey': [
    { value: 'low', label: 'Low Altitude', description: 'e.g., Brazil, Asia', icon: 'landscape' },
  ],
  'classic-bold|washed': [
    { value: 'medium', label: 'Medium Altitude', description: 'Central & South America', icon: 'filter_hdr' },
  ],
};

const TEMP_MAP: Record<string, TempResult> = {
  'fruity-floral|washed|high': { min: 93, max: 95, note: 'Bright, clean fruity/floral notes from washed high-altitude beans' },
  'fruity-floral|natural|high': { min: 91, max: 93, note: 'Sweet, fruity complexity from natural high-altitude beans' },
  'fruity-floral|anaerobic|all': { min: 85, max: 89, note: 'Delicate anaerobic flavors — lower temp preserves unique profiles' },
  'fruity-floral|infused|all': { min: 85, max: 88, note: 'Exotic infused/co-fermented flavors — brew gently at low temp' },
  'classic-bold|natural-honey|low': { min: 88, max: 90, note: 'Rich, full-bodied cup from natural/honey low-altitude beans' },
  'classic-bold|washed|medium': { min: 90, max: 92, note: 'Classic balanced extraction from washed medium-altitude beans' },
};

interface PourStep {
  label: string;
  amount: number;
  cumulative: number;
  description: string;
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  brewType = signal<BrewType>('hot');
  flavorProfile = signal<FlavorProfile | null>(null);
  processingMethod = signal<ProcessingMethod | null>(null);
  originAltitude = signal<OriginAltitude | null>(null);
  coffeeAmount = signal(15);
  waterAmount = signal(225);
  recipeCalculated = signal(false);

  // Timer state
  timerSeconds = signal(30);
  timerRunning = signal(false);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed recipe values
  hotSteps = signal<PourStep[]>([]);
  coldSteps = signal<PourStep[]>([]);
  iceAmount = signal(0);
  coldWaterAmount = signal(0);

  // Available options based on selections
  processingOptions = computed<ProcessingOption[]>(() => {
    const flavor = this.flavorProfile();
    if (!flavor) return [];
    return PROCESSING_OPTIONS[flavor] || [];
  });

  originOptions = computed<OriginOption[]>(() => {
    const flavor = this.flavorProfile();
    const processing = this.processingMethod();
    if (!flavor || !processing) return [];
    return ORIGIN_OPTIONS[`${flavor}|${processing}`] || [];
  });

  temperature = computed<TempResult | null>(() => {
    const flavor = this.flavorProfile();
    const processing = this.processingMethod();
    const origin = this.originAltitude();
    if (!flavor || !processing || !origin) return null;
    return TEMP_MAP[`${flavor}|${processing}|${origin}`] || null;
  });

  onFlavorChange(value: FlavorProfile): void {
    this.flavorProfile.set(value);
    this.processingMethod.set(null);
    this.originAltitude.set(null);
    this.recipeCalculated.set(false);
  }

  onProcessingChange(value: ProcessingMethod): void {
    this.processingMethod.set(value);
    this.originAltitude.set(null);
    this.recipeCalculated.set(false);
    // Auto-select origin if only one option
    const flavor = this.flavorProfile();
    if (flavor) {
      const origins = ORIGIN_OPTIONS[`${flavor}|${value}`] || [];
      if (origins.length === 1) {
        this.originAltitude.set(origins[0].value);
      }
    }
  }

  onOriginChange(value: OriginAltitude): void {
    this.originAltitude.set(value);
    this.recipeCalculated.set(false);
  }

  onCoffeeChange(value: string): void {
    const coffee = parseFloat(value);
    if (!isNaN(coffee) && coffee > 0) {
      this.coffeeAmount.set(coffee);
      this.waterAmount.set(Math.round(coffee * 15));
    }
  }

  onWaterChange(value: string): void {
    const water = parseFloat(value);
    if (!isNaN(water) && water > 0) {
      this.waterAmount.set(water);
      this.coffeeAmount.set(Math.round(water / 15));
    }
  }

  calculateRecipe(): void {
    const coffee = this.coffeeAmount();
    const water = this.waterAmount();

    if (coffee <= 0 || water <= 0) return;

    // Hot recipe
    const firstPour = coffee * 2;
    const remainingWater = water - firstPour;
    const pourAmount = Math.round(remainingWater / 3);

    let cumulative = firstPour;
    const hotSteps: PourStep[] = [
      {
        label: 'Bloom',
        amount: firstPour,
        cumulative: firstPour,
        description: `Pour ${firstPour}g of water for the bloom. Wait 30 seconds.`,
      },
    ];

    for (let i = 1; i <= 3; i++) {
      const amt = i === 3 ? water - cumulative : pourAmount;
      cumulative += amt;
      hotSteps.push({
        label: `Pour ${i}`,
        amount: amt,
        cumulative,
        description: `Pour ${amt}g of water in a slow circular motion.`,
      });
    }
    this.hotSteps.set(hotSteps);

    // Cold recipe
    const halfTotal = Math.round(water / 2);
    this.iceAmount.set(halfTotal);
    this.coldWaterAmount.set(halfTotal);
    const coldPourAmount = Math.round(halfTotal / 3);

    let coldCumulative = 0;
    const coldSteps: PourStep[] = [];
    for (let i = 1; i <= 3; i++) {
      const amt = i === 3 ? halfTotal - coldCumulative : coldPourAmount;
      coldCumulative += amt;
      coldSteps.push({
        label: `Pour ${i}`,
        amount: amt,
        cumulative: coldCumulative,
        description: `Pour ${amt}g of water in a slow circular motion.`,
      });
    }
    this.coldSteps.set(coldSteps);

    this.recipeCalculated.set(true);
  }

  startTimer(): void {
    if (this.timerRunning()) return;
    this.timerRunning.set(true);
    this.timerInterval = setInterval(() => {
      const current = this.timerSeconds();
      if (current <= 1) {
        this.timerSeconds.set(0);
        this.stopTimer();
      } else {
        this.timerSeconds.set(current - 1);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning.set(false);
  }

  resetTimer(): void {
    this.stopTimer();
    this.timerSeconds.set(30);
  }

  get timerDisplay(): string {
    const s = this.timerSeconds();
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  get timerDone(): boolean {
    return this.timerSeconds() === 0 && !this.timerRunning();
  }

  resetApp(): void {
    this.brewType.set('hot');
    this.flavorProfile.set(null);
    this.processingMethod.set(null);
    this.originAltitude.set(null);
    this.coffeeAmount.set(15);
    this.waterAmount.set(225);
    this.recipeCalculated.set(false);
    this.resetTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
