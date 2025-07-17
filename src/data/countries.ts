import { Country } from '../types';

export const countries: Country[] = [
  {
    id: 'germany',
    name: 'آلمان',
    nameEn: 'Germany',
    position: { x: 48, y: 32 },
    isOccupied: false,
    power: 95,
    resources: { oil: 4000, food: 6000, metals: 8000, weapons: 5000, soldiers: 80000, goods: 3500, aircraft: 100, tanks: 150, missiles: 200, submarines: 50, electricity: 10000, ships: 80, defense: 100 },
    flag: '🇩🇪',
    svgPath: 'M480 320 Q490 310 510 315 Q530 320 540 340 Q535 360 520 365 Q500 370 485 360 Q475 350 480 330 Z'
  },
  {
    id: 'soviet_union',
    name: 'اتحاد شوروی',
    nameEn: 'Soviet Union',
    position: { x: 70, y: 22 },
    isOccupied: false,
    power: 92,
    resources: { oil: 8000, food: 10000, metals: 9000, weapons: 4000, soldiers: 120000, goods: 4000, aircraft: 150, tanks: 200, missiles: 300, submarines: 80, electricity: 15000, ships: 120, defense: 120 },
    flag: '🚩',
    svgPath: 'M650 250 Q700 240 750 250 Q800 255 850 270 Q860 290 850 310 Q800 320 750 315 Q700 310 650 300 Z'
  },
  {
    id: 'usa',
    name: 'ایالات متحده',
    nameEn: 'United States',
    position: { x: 18, y: 38 },
    isOccupied: false,
    power: 98,
    resources: { oil: 10000, food: 8000, metals: 7000, weapons: 6000, soldiers: 100000, goods: 5000, aircraft: 200, tanks: 180, missiles: 250, submarines: 100, electricity: 20000, ships: 150, defense: 150 },
    flag: '🇺🇸',
    svgPath: 'M200 400 Q250 390 300 400 Q350 410 380 430 Q370 450 340 460 Q290 470 240 465 Q190 460 180 440 Q185 420 200 400 Z'
  },
  {
    id: 'uk',
    name: 'بریتانیا',
    nameEn: 'United Kingdom',
    position: { x: 43, y: 28 },
    isOccupied: false,
    power: 85,
    resources: { oil: 3000, food: 5000, metals: 4000, weapons: 7000, soldiers: 60000, goods: 2800, aircraft: 120, tanks: 100, missiles: 150, submarines: 60, electricity: 8000, ships: 100, defense: 80 },
    flag: '🇬🇧',
    svgPath: 'M450 300 Q460 295 470 300 Q475 310 470 320 Q460 325 450 320 Q445 310 450 300 Z'
  },
  {
    id: 'japan',
    name: 'ژاپن',
    nameEn: 'Japan',
    position: { x: 88, y: 42 },
    isOccupied: false,
    power: 88,
    resources: { oil: 2000, food: 4000, metals: 6000, weapons: 8000, soldiers: 70000, goods: 3200, aircraft: 180, tanks: 120, missiles: 200, submarines: 70, electricity: 12000, ships: 140, defense: 90 },
    flag: '🇯🇵',
    svgPath: 'M850 450 Q860 445 870 450 Q875 460 870 470 Q860 475 850 470 Q845 460 850 450 Z'
  },
  {
    id: 'north_korea',
    name: 'کره شمالی',
    nameEn: 'North Korea',
    position: { x: 84, y: 38 },
    isOccupied: false,
    power: 55,
    resources: { oil: 1500, food: 3000, metals: 2500, weapons: 4000, soldiers: 80000, goods: 1000, aircraft: 40, tanks: 80, missiles: 150, submarines: 20, electricity: 3000, ships: 25, defense: 60 },
    flag: '🇰🇵',
    svgPath: 'M820 420 Q830 415 840 420 Q845 430 840 440 Q830 445 820 440 Q815 430 820 420 Z'
  },
  {
    id: 'italy',
    name: 'ایتالیا',
    nameEn: 'Italy',
    position: { x: 50, y: 42 },
    isOccupied: false,
    power: 70,
    resources: { oil: 2500, food: 6000, metals: 3000, weapons: 3500, soldiers: 45000, goods: 2200, aircraft: 80, tanks: 90, missiles: 100, submarines: 40, electricity: 6000, ships: 70, defense: 50 },
    flag: '🇮🇹',
    svgPath: 'M500 450 Q505 440 510 450 Q515 470 510 480 Q505 485 500 480 Q495 470 500 450 Z'
  },
  {
    id: 'france',
    name: 'فرانسه',
    nameEn: 'France',
    position: { x: 44, y: 36 },
    isOccupied: false,
    power: 75,
    resources: { oil: 3000, food: 7000, metals: 4000, weapons: 4000, soldiers: 50000, goods: 2600, aircraft: 90, tanks: 110, missiles: 120, submarines: 45, electricity: 7000, ships: 85, defense: 60 },
    flag: '🇫🇷',
    svgPath: 'M460 380 Q470 375 480 380 Q485 390 480 400 Q470 405 460 400 Q455 390 460 380 Z'
  },
  {
    id: 'china',
    name: 'چین',
    nameEn: 'China',
    position: { x: 76, y: 38 },
    isOccupied: false,
    power: 65,
    resources: { oil: 1000, food: 12000, metals: 2000, weapons: 2000, soldiers: 150000, goods: 1800, aircraft: 60, tanks: 200, missiles: 80, submarines: 30, electricity: 5000, ships: 60, defense: 40 },
    flag: '🇨🇳',
    svgPath: 'M750 400 Q780 395 810 400 Q840 405 850 420 Q845 440 820 445 Q790 450 760 445 Q740 440 750 420 Z'
  },
  {
    id: 'canada',
    name: 'کانادا',
    nameEn: 'Canada',
    position: { x: 20, y: 22 },
    isOccupied: false,
    power: 60,
    resources: { oil: 6000, food: 5000, metals: 5000, weapons: 2000, soldiers: 30000, goods: 2000, aircraft: 50, tanks: 60, missiles: 70, submarines: 25, electricity: 8000, ships: 50, defense: 40 },
    flag: '🇨🇦',
    svgPath: 'M220 250 Q270 245 320 250 Q370 255 400 270 Q395 290 370 295 Q320 300 270 295 Q220 290 200 270 Q205 260 220 250 Z'
  },
  {
    id: 'australia',
    name: 'استرالیا',
    nameEn: 'Australia',
    position: { x: 82, y: 72 },
    isOccupied: false,
    power: 55,
    resources: { oil: 4000, food: 4000, metals: 6000, weapons: 2500, soldiers: 25000, goods: 1500, aircraft: 40, tanks: 50, missiles: 60, submarines: 20, electricity: 6000, ships: 45, defense: 35 },
    flag: '🇦🇺',
    svgPath: 'M800 700 Q830 695 860 700 Q890 705 900 720 Q895 740 870 745 Q840 750 810 745 Q790 740 800 720 Z'
  },
  {
    id: 'brazil',
    name: 'برزیل',
    nameEn: 'Brazil',
    position: { x: 28, y: 62 },
    isOccupied: false,
    power: 50,
    resources: { oil: 3000, food: 8000, metals: 3000, weapons: 1500, soldiers: 40000, goods: 1800, aircraft: 35, tanks: 40, missiles: 50, submarines: 15, electricity: 4000, ships: 40, defense: 30 },
    flag: '🇧🇷',
    svgPath: 'M300 650 Q330 645 360 650 Q390 655 400 670 Q395 690 370 695 Q340 700 310 695 Q290 690 300 670 Z'
  },
  {
    id: 'poland',
    name: 'لهستان',
    nameEn: 'Poland',
    position: { x: 54, y: 30 },
    isOccupied: false,
    power: 45,
    resources: { oil: 1500, food: 5000, metals: 3000, weapons: 2000, soldiers: 35000, goods: 1200, aircraft: 30, tanks: 45, missiles: 40, submarines: 10, electricity: 3000, ships: 25, defense: 25 },
    flag: '🇵🇱',
    svgPath: 'M520 320 Q530 315 540 320 Q545 330 540 340 Q530 345 520 340 Q515 330 520 320 Z'
  },
  {
    id: 'norway',
    name: 'نروژ',
    nameEn: 'Norway',
    position: { x: 48, y: 18 },
    isOccupied: false,
    power: 40,
    resources: { oil: 4000, food: 3000, metals: 2000, weapons: 1500, soldiers: 20000, goods: 1000, aircraft: 25, tanks: 30, missiles: 35, submarines: 15, electricity: 5000, ships: 30, defense: 20 },
    flag: '🇳🇴',
    svgPath: 'M500 200 Q510 195 520 200 Q525 210 520 220 Q510 225 500 220 Q495 210 500 200 Z'
  },
  {
    id: 'turkey',
    name: 'ترکیه',
    nameEn: 'Turkey',
    position: { x: 58, y: 46 },
    isOccupied: false,
    power: 50,
    resources: { oil: 2000, food: 6000, metals: 3000, weapons: 2500, soldiers: 45000, goods: 1400, aircraft: 40, tanks: 55, missiles: 45, submarines: 12, electricity: 4000, ships: 35, defense: 30 },
    flag: '🇹🇷',
    svgPath: 'M550 480 Q570 475 590 480 Q610 485 615 500 Q610 520 590 525 Q570 530 550 525 Q540 520 550 500 Z'
  },
  {
    id: 'iran',
    name: 'ایران',
    nameEn: 'Iran',
    position: { x: 64, y: 48 },
    isOccupied: false,
    power: 48,
    resources: { oil: 8000, food: 4000, metals: 2000, weapons: 2000, soldiers: 40000, goods: 1600, aircraft: 35, tanks: 50, missiles: 60, submarines: 8, electricity: 3500, ships: 30, defense: 25 },
    flag: '🇮🇷',
    svgPath: 'M620 500 Q640 495 660 500 Q680 505 685 520 Q680 540 660 545 Q640 550 620 545 Q610 540 620 520 Z'
  },
  // 7 کشور جدید
  {
    id: 'greece',
    name: 'یونان',
    nameEn: 'Greece',
    position: { x: 52, y: 48 },
    isOccupied: false,
    power: 35,
    resources: { oil: 1000, food: 3000, metals: 1500, weapons: 1800, soldiers: 25000, goods: 800, aircraft: 20, tanks: 25, missiles: 15, submarines: 5, electricity: 2000, ships: 15, defense: 20 },
    flag: '🇬🇷',
    svgPath: 'M520 480 Q530 475 540 480 Q545 490 540 500 Q530 505 520 500 Q515 490 520 480 Z'
  },
  {
    id: 'india',
    name: 'هند',
    nameEn: 'India',
    position: { x: 68, y: 52 },
    isOccupied: false,
    power: 42,
    resources: { oil: 800, food: 15000, metals: 1200, weapons: 1500, soldiers: 200000, goods: 1000, aircraft: 25, tanks: 30, missiles: 20, submarines: 3, electricity: 2500, ships: 20, defense: 15 },
    flag: '🇮🇳',
    svgPath: 'M680 520 Q700 515 720 520 Q740 525 745 540 Q740 560 720 565 Q700 570 680 565 Q670 560 680 540 Z'
  },
  {
    id: 'romania',
    name: 'رومانی',
    nameEn: 'Romania',
    position: { x: 56, y: 34 },
    isOccupied: false,
    power: 38,
    resources: { oil: 3000, food: 4000, metals: 2000, weapons: 2200, soldiers: 30000, goods: 1100, aircraft: 30, tanks: 35, missiles: 25, submarines: 8, electricity: 2800, ships: 12, defense: 22 },
    flag: '🇷🇴',
    svgPath: 'M560 340 Q570 335 580 340 Q585 350 580 360 Q570 365 560 360 Q555 350 560 340 Z'
  },
  {
    id: 'finland',
    name: 'فنلاند',
    nameEn: 'Finland',
    position: { x: 52, y: 16 },
    isOccupied: false,
    power: 36,
    resources: { oil: 1200, food: 2500, metals: 1800, weapons: 1600, soldiers: 18000, goods: 900, aircraft: 22, tanks: 28, missiles: 18, submarines: 6, electricity: 3000, ships: 18, defense: 18 },
    flag: '🇫🇮',
    svgPath: 'M520 160 Q530 155 540 160 Q545 170 540 180 Q530 185 520 180 Q515 170 520 160 Z'
  },
  {
    id: 'switzerland',
    name: 'سوئیس',
    nameEn: 'Switzerland',
    position: { x: 46, y: 40 },
    isOccupied: false,
    power: 32,
    resources: { oil: 500, food: 2000, metals: 1000, weapons: 1200, soldiers: 15000, goods: 1500, aircraft: 15, tanks: 20, missiles: 12, submarines: 2, electricity: 2200, ships: 8, defense: 25 },
    flag: '🇨🇭',
    svgPath: 'M460 400 Q470 395 480 400 Q485 410 480 420 Q470 425 460 420 Q455 410 460 400 Z'
  },
  {
    id: 'spain',
    name: 'اسپانیا',
    nameEn: 'Spain',
    position: { x: 40, y: 44 },
    isOccupied: false,
    power: 40,
    resources: { oil: 1500, food: 5000, metals: 2000, weapons: 2000, soldiers: 35000, goods: 1300, aircraft: 28, tanks: 32, missiles: 22, submarines: 10, electricity: 3200, ships: 25, defense: 28 },
    flag: '🇪🇸',
    svgPath: 'M400 440 Q420 435 440 440 Q460 445 465 460 Q460 480 440 485 Q420 490 400 485 Q390 480 400 460 Z'
  },
  {
    id: 'egypt',
    name: 'مصر',
    nameEn: 'Egypt',
    position: { x: 54, y: 56 },
    isOccupied: false,
    power: 34,
    resources: { oil: 2000, food: 6000, metals: 1200, weapons: 1800, soldiers: 40000, goods: 1000, aircraft: 18, tanks: 25, missiles: 15, submarines: 4, electricity: 2000, ships: 12, defense: 20 },
    flag: '🇪🇬',
    svgPath: 'M540 560 Q560 555 580 560 Q600 565 605 580 Q600 600 580 605 Q560 610 540 605 Q530 600 540 580 Z'
  }
];