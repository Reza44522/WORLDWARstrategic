export interface User {
  id: string;
  username: string;
  email: string;
  country?: string;
  resources: Resources;
  money: number;
  role: 'player' | 'admin' | 'assistant';
  createdAt: Date;
  lastActive: Date;
  isSuspended: boolean;
  countrySelectedAt?: Date;
  buildings?: Buildings;
  isMuted?: boolean;
  muteExpiresAt?: Date;
  isTimedOut?: boolean;
  timeoutExpiresAt?: Date;
}

export interface Resources {
  oil: number;
  food: number;
  metals: number;
  weapons: number;
  soldiers: number;
  goods: number;
  aircraft: number;
  tanks: number;
  missiles: number;
  submarines: number;
  electricity: number;
  ships: number;
  defense: number; // New defense resource
}

export interface Buildings {
  oilRefinery: number;
  militaryBarracks: number;
  missileFactory: number;
  aircraftFactory: number;
  metalMine: number;
  powerPlant: number;
  tankFactory?: number;
  goodsFactory?: number;
  shipyard?: number;
  submarineFactory?: number;
  defenseSystem?: number; // New defense building
}

export interface BuildingPrices {
  oilRefinery: { level1: number; level2: number; level3: number; level4: number; level5: number };
  militaryBarracks: { level1: number; level2: number; level3: number; level4: number; level5: number };
  missileFactory: { level1: number; level2: number; level3: number; level4: number; level5: number };
  aircraftFactory: { level1: number; level2: number; level3: number; level4: number; level5: number };
  metalMine: { level1: number; level2: number; level3: number; level4: number; level5: number };
  powerPlant: { level1: number; level2: number; level3: number; level4: number; level5: number };
  defenseSystem: { level1: number; level2: number; level3: number; level4: number; level5: number };
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  position: { x: number; y: number };
  isOccupied: boolean;
  occupiedBy?: string;
  power: number;
  resources: Resources;
  flag: string;
  svgPath?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'public' | 'private' | 'alliance' | 'admin_announcement' | 'admin_private' | 'support';
  recipient?: string;
  allianceId?: string;
  isAdminMessage?: boolean;
  senderCountry?: string;
  isRead?: boolean;
}

export interface NewsItem {
  id: string;
  type: 'war' | 'alliance' | 'trade' | 'upgrade' | 'country_selection' | 'peace' | 'general';
  title: string;
  description: string;
  involvedCountries: string[];
  involvedPlayers: string[];
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
}

export interface Alliance {
  id: string;
  name: string;
  members: string[];
  leader: string;
  createdAt: Date;
}

export interface Trade {
  id: string;
  seller: string;
  buyer?: string;
  resourceType: keyof Resources;
  amount: number;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface TradeProposal {
  id: string;
  proposer: string;
  proposerName: string;
  type: 'buy' | 'sell';
  resourceType: keyof Resources;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  status: 'active' | 'accepted' | 'countered' | 'cancelled';
  createdAt: Date;
  counterOffers?: CounterOffer[];
}

export interface CounterOffer {
  id: string;
  proposalId: string;
  counterOfferer: string;
  counterOffererName: string;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface SupportRequest {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  recipientName: string;
  type: 'economic' | 'military' | 'resource' | 'goods';
  amount: number;
  resourceType?: keyof Resources | 'money';
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  sender: string;
  senderName: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: Date;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  sender: string;
  senderName: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface BattleStatistics {
  attackerLosses: {
    soldiers: number;
    tanks: number;
    aircraft: number;
    missiles: number;
    submarines: number;
    ships: number;
  };
  defenderLosses: {
    soldiers: number;
    tanks: number;
    aircraft: number;
    missiles: number;
    submarines: number;
    ships: number;
    defense: number;
  };
  defenseEffectiveness: {
    aircraftDestroyed: number;
    missilesDestroyed: number;
    totalAirAttacksBlocked: number;
  };
  navalBattle: {
    attackerShipsLost: number;
    attackerSubmarinesLost: number;
    defenderShipsLost: number;
    defenderSubmarinesLost: number;
  };
  groundBattle: {
    attackerTanksLost: number;
    attackerSoldiersLost: number;
    defenderTanksLost: number;
    defenderSoldiersLost: number;
  };
  winner: 'attacker' | 'defender' | 'draw';
  damageDealt: number;
  damageReceived: number;
}

export interface War {
  id: string;
  aggressor: string;
  defender: string;
  status: 'declared' | 'active' | 'ended' | 'ceasefire';
  startTime: Date;
  endTime?: Date;
  winner?: string;
  attackForce?: {
    soldiers: number;
    tanks: number;
    aircraft: number;
    missiles: number;
    submarines: number;
    ships: number;
  };
  reinforcements?: WarReinforcement[];
  battleStatistics?: BattleStatistics;
  losses?: {
    attackerLosses: {
      soldiers: number;
      tanks: number;
      aircraft: number;
      missiles: number;
      submarines: number;
      ships: number;
    };
    defenderLosses: {
      soldiers: number;
      tanks: number;
      aircraft: number;
      missiles: number;
      submarines: number;
      ships: number;
      defense: number;
    };
  };
  ceasefireEndTime?: Date;
}

export interface WarReinforcement {
  id: string;
  warId: string;
  sender: string;
  senderName: string;
  force: {
    soldiers: number;
    tanks: number;
    aircraft: number;
    missiles: number;
    submarines: number;
    ships: number;
  };
  timestamp: Date;
}

export interface PeaceProposal {
  id: string;
  proposer: string;
  proposerName: string;
  target: string;
  targetName: string;
  type: 'peace' | 'ceasefire';
  duration?: number; // in hours for ceasefire
  terms?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface AllianceInvitation {
  id: string;
  sender: string;
  senderName: string;
  target: string;
  targetName: string;
  allianceName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface GameEvent {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface MarketPrices {
  oil: number;
  food: number;
  metals: number;
  weapons: number;
  soldiers: number;
  goods: number;
  aircraft: number;
  tanks: number;
  missiles: number;
  submarines: number;
  electricity: number;
  ships: number;
  defense: number;
}

export interface GameSettings {
  maxPlayers: number;
  seasonDuration: number;
  seasonStartDate: Date;
  dailyResourceProduction: Resources;
  dailyResourceConsumption: Resources;
  initialResources: Resources;
  initialMoney: number;
  marketPrices: MarketPrices;
  shieldProtectionTime: number; // in milliseconds
  buildingPrices: BuildingPrices;
  productionTime?: number; // in milliseconds, default 20 seconds
  robotBuybackPercentage: number; // percentage of market price for robot buyback
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'war' | 'alliance' | 'trade' | 'support' | 'admin' | 'general' | 'battle';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  data?: any; // Additional data for specific notification types
}

export interface PlayerRanking {
  userId: string;
  username: string;
  country?: string;
  totalPower: number;
  rank: number;
}

// Audio System Types
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  uploadedBy: string;
  uploadedAt: Date;
  isActive: boolean;
}

export interface MusicSettings {
  isEnabled: boolean;
  autoPlay: boolean;
  volume: number;
  currentTrackId?: string;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

export interface AlertSettings {
  isEnabled: boolean;
  alertSoundUrl: string;
  volume: number;
  showVisualAlert: boolean;
  alertDuration: number; // in seconds
}

export interface WarAlert {
  id: string;
  attackerName: string;
  defenderName: string;
  attackerCountry: string;
  defenderCountry: string;
  timestamp: Date;
  isActive: boolean;
}