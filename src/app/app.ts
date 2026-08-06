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
type Lang = 'en' | 'ar';

interface ProcessingOption {
  value: ProcessingMethod;
  labelKey: string;
  icon: string;
}

interface OriginOption {
  value: OriginAltitude;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}

interface TempResult {
  min: number;
  max: number;
  noteKey: string;
}

const PROCESSING_OPTIONS: Record<FlavorProfile, ProcessingOption[]> = {
  'fruity-floral': [
    { value: 'washed', labelKey: 'proc_washed', icon: 'water_drop' },
    { value: 'natural', labelKey: 'proc_natural', icon: 'spa' },
    { value: 'anaerobic', labelKey: 'proc_anaerobic', icon: 'science' },
    { value: 'infused', labelKey: 'proc_infused', icon: 'biotech' },
  ],
  'classic-bold': [
    { value: 'natural-honey', labelKey: 'proc_natural_honey', icon: 'spa' },
    { value: 'washed', labelKey: 'proc_washed', icon: 'water_drop' },
  ],
};

const ORIGIN_OPTIONS: Record<string, OriginOption[]> = {
  'fruity-floral|washed': [
    { value: 'high', labelKey: 'origin_high', descriptionKey: 'origin_high_ff_washed_desc', icon: 'terrain' },
  ],
  'fruity-floral|natural': [
    { value: 'high', labelKey: 'origin_high', descriptionKey: 'origin_high_ff_natural_desc', icon: 'terrain' },
  ],
  'fruity-floral|anaerobic': [
    { value: 'all', labelKey: 'origin_all', descriptionKey: 'origin_all_desc', icon: 'public' },
  ],
  'fruity-floral|infused': [
    { value: 'all', labelKey: 'origin_all', descriptionKey: 'origin_all_desc', icon: 'public' },
  ],
  'classic-bold|natural-honey': [
    { value: 'low', labelKey: 'origin_low', descriptionKey: 'origin_low_desc', icon: 'landscape' },
  ],
  'classic-bold|washed': [
    { value: 'medium', labelKey: 'origin_medium', descriptionKey: 'origin_medium_desc', icon: 'filter_hdr' },
  ],
};

const TEMP_MAP: Record<string, TempResult> = {
  'fruity-floral|washed|high': { min: 93, max: 95, noteKey: 'temp_note_ff_washed_high' },
  'fruity-floral|natural|high': { min: 91, max: 93, noteKey: 'temp_note_ff_natural_high' },
  'fruity-floral|anaerobic|all': { min: 85, max: 89, noteKey: 'temp_note_ff_anaerobic' },
  'fruity-floral|infused|all': { min: 85, max: 88, noteKey: 'temp_note_ff_infused' },
  'classic-bold|natural-honey|low': { min: 88, max: 90, noteKey: 'temp_note_cb_natural_honey' },
  'classic-bold|washed|medium': { min: 90, max: 92, noteKey: 'temp_note_cb_washed' },
};

const I18N: Record<Lang, Record<string, string>> = {
  en: {
    lang_en: 'EN',
    lang_ar: 'AR',
    header_title: 'V60 Coffee Brewing Guide',
    header_subtitle: 'Follow these steps to brew the perfect V60 coffee',
    step1_title: 'Select Your Brew Type',
    hot_v60: 'Hot V60',
    cold_v60: 'Cold V60',
    step2_title: 'Flavor Profile',
    fruity_floral: 'Fruity / Floral',
    classic_bold: 'Classic / Bold',
    step3_title: 'Processing Method',
    proc_washed: 'Washed',
    proc_natural: 'Natural',
    proc_anaerobic: 'Anaerobic / Carbonic',
    proc_infused: 'Infused / Co-fermented',
    proc_natural_honey: 'Natural / Honey',
    step4_title: 'Origin / Altitude',
    origin_high: 'High Altitude',
    origin_high_ff_washed_desc: 'e.g., Ethiopia, Kenya',
    origin_high_ff_natural_desc: 'e.g., Ethiopia, Colombia',
    origin_medium: 'Medium Altitude',
    origin_medium_desc: 'Central & South America',
    origin_low: 'Low Altitude',
    origin_low_desc: 'e.g., Brazil, Asia',
    origin_all: 'All Origins',
    origin_all_desc: 'Any origin works',
    origin_notice_label: 'Origin:',
    step5_title: 'Enter Coffee or Water Amount',
    coffee_grams: 'Coffee (grams)',
    water_grams: 'Water (grams)',
    ratio_1x: 'Ratio (1:X)',
    ratio_hint: 'Ratio: 1:{ratio} (coffee to water)',
    calculate_recipe: 'Calculate Recipe',
    step6_title: 'Brewing Instructions',
    recommended_temp: 'Recommended Temperature: {min}°C – {max}°C',
    coffee_label: 'Coffee:',
    water_label: 'Water:',
    ice_label: 'Ice:',
    ratio_label: 'Ratio:',
    flavor_label: 'Flavor:',
    processing_label: 'Processing:',
    pouring_steps: 'Pouring Steps',
    bloom: 'Bloom',
    pour_n: 'Pour {n}',
    ice_step: 'Ice',
    ice_desc: 'Place {amount}g of ice in your server/carafe.',
    bloom_desc: 'Pour {amount}g of water for the bloom. Wait 30 seconds.',
    pour_desc: 'Pour {amount}g of water in a slow circular motion.',
    cumulative: 'Cumulative: {amount}g',
    time_up: "Time's up!",
    start: 'Start',
    reset: 'Reset',
    skip: 'Skip',
    enjoy: 'Enjoy your coffee',
    print_recipe: 'Print Recipe',
    start_over: 'Start Over',
    temp_note_ff_washed_high: 'Bright, clean fruity/floral notes from washed high-altitude beans',
    temp_note_ff_natural_high: 'Sweet, fruity complexity from natural high-altitude beans',
    temp_note_ff_anaerobic: 'Delicate anaerobic flavors — lower temp preserves unique profiles',
    temp_note_ff_infused: 'Exotic infused/co-fermented flavors — brew gently at low temp',
    temp_note_cb_natural_honey: 'Rich, full-bodied cup from natural/honey low-altitude beans',
    temp_note_cb_washed: 'Classic balanced extraction from washed medium-altitude beans',
  },
  ar: {
    lang_en: 'EN',
    lang_ar: 'AR',
    header_title: 'دليل تحضير قهوة V60',
    header_subtitle: 'اتبع هذه الخطوات لتحضير قهوة V60 مثالية',
    step1_title: 'اختر نوع التحضير',
    hot_v60: 'V60 ساخن',
    cold_v60: 'V60 بارد',
    step2_title: 'نوع المحصول',
    fruity_floral: 'فاكهي',
    classic_bold: 'كلاسيكي',
    step3_title: 'طريقة المعالجة',
    proc_washed: 'مغسول',
    proc_natural: 'طبيعي/مجفف',
    proc_anaerobic: 'لاهوائي / كربوني',
    proc_infused: 'منقوع / مخمّر',
    proc_natural_honey: 'طبيعي/عسلي/مجفف',
    step4_title: 'المنشأ / الارتفاع',
    origin_high: 'ارتفاع عالٍ',
    origin_high_ff_washed_desc: 'مثل إثيوبيا، كينيا',
    origin_high_ff_natural_desc: 'مثل إثيوبيا، كولومبيا',
    origin_medium: 'ارتفاع متوسط',
    origin_medium_desc: 'أمريكا الوسطى والجنوبية',
    origin_low: 'ارتفاع منخفض',
    origin_low_desc: 'مثل البرازيل، آسيا',
    origin_all: 'جميع المناشئ',
    origin_all_desc: 'أي منشأ يناسب',
    origin_notice_label: 'المنشأ:',
    step5_title: 'أدخل كمية القهوة أو الماء',
    coffee_grams: 'القهوة (غرام)',
    water_grams: 'الماء (غرام)',
    ratio_1x: 'النسبة (1:X)',
    ratio_hint: 'النسبة: 1:{ratio} (قهوة إلى ماء)',
    calculate_recipe: 'احسب الوصفة',
    step6_title: 'تعليمات التحضير',
    recommended_temp: 'درجة الحرارة الموصى بها: {min}°م – {max}°م',
    coffee_label: 'القهوة:',
    water_label: 'الماء:',
    ice_label: 'الثلج:',
    ratio_label: 'النسبة:',
    flavor_label: 'النكهة:',
    processing_label: 'المعالجة:',
    pouring_steps: 'خطوات الصب',
    bloom: 'بلومنج',
    pour_n: 'صبّة {n}',
    ice_step: 'الثلج',
    ice_desc: 'ضع {amount} غرام من الثلج في الإبريق.',
    bloom_desc: 'اسكب {amount} غرام من الماء للبلومنج. انتظر 30 ثانية.',
    pour_desc: 'اسكب {amount} غرام من الماء بحركة دائرية بطيئة.',
    cumulative: 'الإجمالي: {amount} غرام',
    time_up: 'انتهى الوقت!',
    start: 'ابدأ',
    reset: 'إعادة',
    skip: 'تخطي',
    enjoy: 'استمتع بقهوتك',
    print_recipe: 'اطبع الوصفة',
    start_over: 'ابدأ من جديد',
    temp_note_ff_washed_high: 'نكهات فواكه وزهور نظيفة ومشرقة من حبوب مغسولة عالية الارتفاع',
    temp_note_ff_natural_high: 'تعقيد فواكه حلو من حبوب طبيعية عالية الارتفاع',
    temp_note_ff_anaerobic: 'نكهات لاهوائية دقيقة — درجة أقل تحافظ على النكهات الفريدة',
    temp_note_ff_infused: 'نكهات منقوعة/مخمّرة استثنائية — يُحضّر بلطف في درجة منخفضة',
    temp_note_cb_natural_honey: 'كوب غني وممتلئ من حبوب طبيعية/عسلية منخفضة الارتفاع',
    temp_note_cb_washed: 'استخلاص كلاسيكي متوازن من حبوب مغسولة متوسطة الارتفاع',
  },
};

interface PourStep {
  labelKey: string;
  labelIndex?: number;
  amount: number;
  cumulative: number;
  descriptionKey: string;
}

const LANG_KEY = 'v60-lang';

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
  language = signal<Lang>(this.readStoredLang());

  constructor() {
    this.applyDocumentLang(this.language());
  }

  private readStoredLang(): Lang {
    if (typeof localStorage === 'undefined') return 'ar';
    const stored = localStorage.getItem(LANG_KEY);
    return stored === 'ar' || stored === 'en' ? stored : 'ar';
  }

  private applyDocumentLang(lang: Lang): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
  brewType = signal<BrewType>('hot');
  flavorProfile = signal<FlavorProfile | null>(null);
  processingMethod = signal<ProcessingMethod | null>(null);
  originAltitude = signal<OriginAltitude | null>(null);
  coffeeAmount = signal(20);
  waterAmount = signal(300);
  ratio = signal(15);
  recipeCalculated = signal(false);
  skipDetails = signal(false);

  timerSeconds = signal(30);
  timerRunning = signal(false);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  hotSteps = signal<PourStep[]>([]);
  coldSteps = signal<PourStep[]>([]);
  iceAmount = signal(0);
  coldWaterAmount = signal(0);

  t(key: string, params?: Record<string, string | number>): string {
    let s = I18N[this.language()][key] ?? I18N.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.split(`{${k}}`).join(String(v));
      }
    }
    return s;
  }

  setLanguage(lang: Lang): void {
    this.language.set(lang);
    this.applyDocumentLang(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_KEY, lang);
    }
  }

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

  flavorLabel = computed<string | null>(() => {
    const f = this.flavorProfile();
    if (!f) return null;
    return this.t(f === 'fruity-floral' ? 'fruity_floral' : 'classic_bold');
  });

  processingLabel = computed<string | null>(() => {
    const f = this.flavorProfile();
    const p = this.processingMethod();
    if (!f || !p) return null;
    const opt = PROCESSING_OPTIONS[f].find(o => o.value === p);
    return opt ? this.t(opt.labelKey) : null;
  });

  amountsStepNumber = computed<number>(() => {
    if (this.skipDetails()) return 3;
    return this.originOptions().length > 1 ? 5 : 4;
  });

  instructionsStepNumber = computed<number>(() => this.amountsStepNumber() + 1);

  stepIcon(n: number): string {
    const icons = ['looks_one', 'looks_two', 'looks_3', 'looks_4', 'looks_5', 'looks_6'];
    return icons[n - 1] ?? 'looks_6';
  }

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
    this.skipDetails.set(false);
    this.recipeCalculated.set(false);
  }

  skipFlavor(): void {
    this.flavorProfile.set(null);
    this.processingMethod.set(null);
    this.originAltitude.set(null);
    this.skipDetails.set(true);
    this.recipeCalculated.set(false);
  }

  onProcessingChange(value: ProcessingMethod): void {
    this.processingMethod.set(value);
    this.originAltitude.set(null);
    this.skipDetails.set(false);
    this.recipeCalculated.set(false);
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
      this.waterAmount.set(Math.round(coffee * this.ratio()));
    }
  }

  onWaterChange(value: string): void {
    const water = parseFloat(value);
    if (!isNaN(water) && water > 0) {
      this.waterAmount.set(water);
      this.coffeeAmount.set(Math.round(water / this.ratio()));
    }
  }

  onRatioChange(value: string): void {
    const r = parseFloat(value);
    if (!isNaN(r) && r > 0) {
      this.ratio.set(r);
      this.waterAmount.set(Math.round(this.coffeeAmount() * r));
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
        labelKey: 'bloom',
        amount: firstPour,
        cumulative: firstPour,
        descriptionKey: 'bloom_desc',
      },
    ];

    for (let i = 1; i <= 3; i++) {
      const amt = i === 3 ? water - cumulative : pourAmount;
      cumulative += amt;
      hotSteps.push({
        labelKey: 'pour_n',
        labelIndex: i,
        amount: amt,
        cumulative,
        descriptionKey: 'pour_desc',
      });
    }
    this.hotSteps.set(hotSteps);

    // Cold recipe
    const halfTotal = Math.round(water / 2);
    this.iceAmount.set(halfTotal);
    this.coldWaterAmount.set(halfTotal);

    const coldPourAmount = Math.round(halfTotal / 3);
    let coldCumulative = coldPourAmount;

    const coldSteps: PourStep[] = [
      {
        labelKey: 'bloom',
        amount: coldPourAmount,
        cumulative: coldPourAmount,
        descriptionKey: 'bloom_desc',
      },
    ];

    for (let i = 1; i <= 2; i++) {
      const amt = i === 2 ? halfTotal - coldCumulative : coldPourAmount;
      coldCumulative += amt;
      coldSteps.push({
        labelKey: 'pour_n',
        labelIndex: i,
        amount: amt,
        cumulative: coldCumulative,
        descriptionKey: 'pour_desc',
      });
    }
    this.coldSteps.set(coldSteps);

    this.recipeCalculated.set(true);
  }

  stepLabel(step: PourStep): string {
    if (step.labelKey === 'pour_n') return this.t('pour_n', { n: step.labelIndex ?? 0 });
    return this.t(step.labelKey);
  }

  stepDescription(step: PourStep): string {
    return this.t(step.descriptionKey, { amount: step.amount });
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

  printRecipe(): void {
    window.print();
  }

  resetApp(): void {
    this.brewType.set('hot');
    this.flavorProfile.set(null);
    this.processingMethod.set(null);
    this.originAltitude.set(null);
    this.coffeeAmount.set(20);
    this.ratio.set(15);
    this.waterAmount.set(300);
    this.recipeCalculated.set(false);
    this.skipDetails.set(false);
    this.resetTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
