import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Country, ChatMessage, Alliance, Trade, War, GameSettings, TradeProposal, SupportRequest, SupportTicket, GameEvent, MarketPrices, PeaceProposal, AllianceInvitation, BuildingPrices, UserReport, Notification, WarReinforcement, CounterOffer } from '../types';
import { countries as initialCountries } from '../data/countries';

interface GameState {
  currentUser: User | null;
  users: User[];
  countries: Country[];
  chatMessages: ChatMessage[];
  alliances: Alliance[];
  trades: Trade[];
  wars: War[];
  tradeProposals: TradeProposal[];
  supportRequests: SupportRequest[];
  supportTickets: SupportTicket[];
  gameEvents: GameEvent[];
  peaceProposals: PeaceProposal[];
  allianceInvitations: AllianceInvitation[];
  userReports: UserReport[];
  notifications: Notification[];
  gameSettings: GameSettings;
  isAuthenticated: boolean;
  unreadChatCount: number;
}

type GameAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'SELECT_COUNTRY'; payload: { userId: string; countryId: string } }
  | { type: 'SEND_MESSAGE'; payload: ChatMessage }
  | { type: 'MARK_MESSAGES_READ'; payload: { type: string } }
  | { type: 'CREATE_ALLIANCE'; payload: Alliance }
  | { type: 'CREATE_TRADE'; payload: Trade }
  | { type: 'CREATE_TRADE_PROPOSAL'; payload: TradeProposal }
  | { type: 'ACCEPT_TRADE_PROPOSAL'; payload: { proposalId: string; buyerId: string } }
  | { type: 'CREATE_COUNTER_OFFER'; payload: CounterOffer }
  | { type: 'ACCEPT_COUNTER_OFFER'; payload: { proposalId: string; counterOfferId: string } }
  | { type: 'SELL_TO_ROBOT'; payload: { userId: string; resourceType: string; amount: number; totalPrice: number } }
  | { type: 'CREATE_SUPPORT_REQUEST'; payload: SupportRequest }
  | { type: 'RESPOND_SUPPORT_REQUEST'; payload: { requestId: string; accepted: boolean } }
  | { type: 'CREATE_SUPPORT_TICKET'; payload: SupportTicket }
  | { type: 'RESPOND_SUPPORT_TICKET'; payload: { ticketId: string; response: any } }
  | { type: 'CLOSE_SUPPORT_TICKET'; payload: { ticketId: string } }
  | { type: 'CREATE_GAME_EVENT'; payload: GameEvent }
  | { type: 'EXPIRE_GAME_EVENT'; payload: { eventId: string } }
  | { type: 'GIFT_ITEMS'; payload: { userId: string; resources: any; money?: number } }
  | { type: 'REMOVE_ITEMS'; payload: { userId: string; resources: any; money?: number } }
  | { type: 'UPDATE_MARKET_PRICES'; payload: MarketPrices }
  | { type: 'DECLARE_WAR'; payload: War }
  | { type: 'SEND_WAR_REINFORCEMENT'; payload: WarReinforcement }
  | { type: 'RETREAT_FROM_WAR'; payload: { warId: string } }
  | { type: 'UPDATE_WAR_STATISTICS'; payload: { warId: string; statistics: any } }
  | { type: 'APPLY_BATTLE_LOSSES'; payload: { attackerId: string; defenderId: string; losses: any } }
  | { type: 'CREATE_PEACE_PROPOSAL'; payload: PeaceProposal }
  | { type: 'RESPOND_PEACE_PROPOSAL'; payload: { proposalId: string; accepted: boolean } }
  | { type: 'CREATE_ALLIANCE_INVITATION'; payload: AllianceInvitation }
  | { type: 'RESPOND_ALLIANCE_INVITATION'; payload: { invitationId: string; accepted: boolean } }
  | { type: 'UPDATE_RESOURCES'; payload: { userId: string; resources: any } }
  | { type: 'TRANSFER_RESOURCES'; payload: { fromUserId: string; toUserId: string; resources: any; money?: number } }
  | { type: 'PROMOTE_TO_ASSISTANT'; payload: { userId: string } }
  | { type: 'DEMOTE_FROM_ASSISTANT'; payload: { userId: string } }
  | { type: 'MUTE_USER'; payload: { userId: string; duration?: number } }
  | { type: 'UNMUTE_USER'; payload: { userId: string } }
  | { type: 'TIMEOUT_USER'; payload: { userId: string; duration: number } }
  | { type: 'REMOVE_TIMEOUT'; payload: { userId: string } }
  | { type: 'REMOVE_PLAYER_FROM_COUNTRY'; payload: { userId: string } }
  | { type: 'CREATE_USER_REPORT'; payload: UserReport }
  | { type: 'RESOLVE_USER_REPORT'; payload: { reportId: string; status: 'resolved' | 'dismissed'; resolvedBy: string } }
  | { type: 'CREATE_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: { notificationId: string } }
  | { type: 'LOAD_DATA'; payload: Partial<GameState> };

const buildingPrices: BuildingPrices = {
  oilRefinery: { level1: 5000, level2: 15000, level3: 35000, level4: 60000, level5: 100000 },
  militaryBarracks: { level1: 8000, level2: 20000, level3: 45000, level4: 80000, level5: 130000 },
  missileFactory: { level1: 12000, level2: 30000, level3: 65000, level4: 110000, level5: 180000 },
  aircraftFactory: { level1: 15000, level2: 40000, level3: 85000, level4: 150000, level5: 250000 },
  metalMine: { level1: 6000, level2: 18000, level3: 40000, level4: 70000, level5: 120000 },
  powerPlant: { level1: 10000, level2: 25000, level3: 55000, level4: 95000, level5: 160000 },
  defenseSystem: { level1: 20000, level2: 50000, level3: 100000, level4: 180000, level5: 300000 }
};

const initialState: GameState = {
  currentUser: null,
  users: [],
  countries: initialCountries,
  chatMessages: [],
  alliances: [],
  trades: [],
  wars: [],
  tradeProposals: [],
  supportRequests: [],
  supportTickets: [],
  gameEvents: [],
  peaceProposals: [],
  allianceInvitations: [],
  userReports: [],
  notifications: [],
  gameSettings: {
    maxPlayers: 15,
    seasonDuration: 30,
    seasonStartDate: new Date(),
    dailyResourceProduction: { oil: 100, food: 150, metals: 80, weapons: 50, soldiers: 500, goods: 120, aircraft: 10, tanks: 15, missiles: 20, submarines: 5, electricity: 200, ships: 8, defense: 10 },
    dailyResourceConsumption: { oil: 50, food: 80, metals: 30, weapons: 20, soldiers: 100, goods: 60, aircraft: 5, tanks: 8, missiles: 10, submarines: 2, electricity: 100, ships: 4, defense: 5 },
    initialResources: { oil: 5000, food: 7000, metals: 4000, weapons: 2000, soldiers: 50000, goods: 3000, aircraft: 100, tanks: 150, missiles: 200, submarines: 50, electricity: 10000, ships: 80, defense: 50 },
    initialMoney: 20000,
    marketPrices: { oil: 10, food: 8, metals: 15, weapons: 25, soldiers: 5, goods: 12, aircraft: 500, tanks: 300, missiles: 200, submarines: 1000, electricity: 2, ships: 800, defense: 100 },
    shieldProtectionTime: 3 * 60 * 1000, // 3 minutes in milliseconds
    buildingPrices,
    productionTime: 20000, // 20 seconds in milliseconds
    robotBuybackPercentage: 50 // 50% of market price
  },
  isAuthenticated: false,
  unreadChatCount: 0
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  try {
    switch (action.type) {
      case 'LOGIN':
        return {
          ...state,
          currentUser: action.payload,
          isAuthenticated: true
        };
      case 'LOGOUT':
        return {
          ...state,
          currentUser: null,
          isAuthenticated: false
        };
      case 'REGISTER':
        const newUsers = [...state.users, action.payload];
        return {
          ...state,
          users: newUsers,
          currentUser: action.payload,
          isAuthenticated: true
        };
      case 'SELECT_COUNTRY':
        const updatedCountries = state.countries.map(country =>
          country.id === action.payload.countryId
            ? { ...country, isOccupied: true, occupiedBy: action.payload.userId }
            : country
        );
        const updatedUsers = state.users.map(user =>
          user.id === action.payload.userId
            ? { 
                ...user, 
                country: action.payload.countryId, 
                countrySelectedAt: new Date(),
                buildings: {
                  oilRefinery: 1,
                  militaryBarracks: 1,
                  metalMine: 1,
                  missileFactory: 0,
                  aircraftFactory: 0,
                  powerPlant: 0,
                  defenseSystem: 0
                }
              }
            : user
        );
        return {
          ...state,
          countries: updatedCountries,
          users: updatedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { 
                ...state.currentUser, 
                country: action.payload.countryId, 
                countrySelectedAt: new Date(),
                buildings: {
                  oilRefinery: 1,
                  militaryBarracks: 1,
                  metalMine: 1,
                  missileFactory: 0,
                  aircraftFactory: 0,
                  powerPlant: 0,
                  defenseSystem: 0
                }
              }
            : state.currentUser
        };
      case 'SEND_MESSAGE':
        return {
          ...state,
          chatMessages: [...state.chatMessages, action.payload],
          unreadChatCount: state.unreadChatCount + 1
        };
      case 'MARK_MESSAGES_READ':
        return {
          ...state,
          unreadChatCount: 0
        };
      case 'PROMOTE_TO_ASSISTANT':
        const promotedUsers = state.users.map(user =>
          user.id === action.payload.userId ? { ...user, role: 'assistant' as const } : user
        );
        return {
          ...state,
          users: promotedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, role: 'assistant' as const }
            : state.currentUser
        };
      case 'DEMOTE_FROM_ASSISTANT':
        const demotedUsers = state.users.map(user =>
          user.id === action.payload.userId ? { ...user, role: 'player' as const } : user
        );
        return {
          ...state,
          users: demotedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, role: 'player' as const }
            : state.currentUser
        };
      case 'MUTE_USER':
        const muteExpiresAt = action.payload.duration 
          ? new Date(Date.now() + action.payload.duration * 60 * 1000)
          : undefined;
        const mutedUsers = state.users.map(user =>
          user.id === action.payload.userId 
            ? { ...user, isMuted: true, muteExpiresAt }
            : user
        );
        return {
          ...state,
          users: mutedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, isMuted: true, muteExpiresAt }
            : state.currentUser
        };
      case 'UNMUTE_USER':
        const unmutedUsers = state.users.map(user =>
          user.id === action.payload.userId 
            ? { ...user, isMuted: false, muteExpiresAt: undefined }
            : user
        );
        return {
          ...state,
          users: unmutedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, isMuted: false, muteExpiresAt: undefined }
            : state.currentUser
        };
      case 'TIMEOUT_USER':
        const timeoutExpiresAt = new Date(Date.now() + action.payload.duration * 60 * 1000);
        const timedOutUsers = state.users.map(user =>
          user.id === action.payload.userId 
            ? { ...user, isTimedOut: true, timeoutExpiresAt }
            : user
        );
        return {
          ...state,
          users: timedOutUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, isTimedOut: true, timeoutExpiresAt }
            : state.currentUser
        };
      case 'REMOVE_TIMEOUT':
        const untimedOutUsers = state.users.map(user =>
          user.id === action.payload.userId 
            ? { ...user, isTimedOut: false, timeoutExpiresAt: undefined }
            : user
        );
        return {
          ...state,
          users: untimedOutUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, isTimedOut: false, timeoutExpiresAt: undefined }
            : state.currentUser
        };
      case 'REMOVE_PLAYER_FROM_COUNTRY':
        const freedCountries = state.countries.map(country =>
          country.occupiedBy === action.payload.userId
            ? { ...country, isOccupied: false, occupiedBy: undefined }
            : country
        );
        const freedUsers = state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, country: undefined, countrySelectedAt: undefined }
            : user
        );
        return {
          ...state,
          countries: freedCountries,
          users: freedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, country: undefined, countrySelectedAt: undefined }
            : state.currentUser
        };
      case 'CREATE_USER_REPORT':
        return {
          ...state,
          userReports: [...state.userReports, action.payload]
        };
      case 'RESOLVE_USER_REPORT':
        const resolvedReports = state.userReports.map(report =>
          report.id === action.payload.reportId
            ? { 
                ...report, 
                status: action.payload.status,
                resolvedBy: action.payload.resolvedBy,
                resolvedAt: new Date()
              }
            : report
        );
        return {
          ...state,
          userReports: resolvedReports
        };
      case 'CREATE_NOTIFICATION':
        return {
          ...state,
          notifications: [...state.notifications, action.payload]
        };
      case 'MARK_NOTIFICATION_READ':
        const readNotifications = state.notifications.map(notification =>
          notification.id === action.payload.notificationId
            ? { ...notification, isRead: true }
            : notification
        );
        return {
          ...state,
          notifications: readNotifications
        };
      case 'CREATE_GAME_EVENT':
        return {
          ...state,
          gameEvents: [...state.gameEvents, action.payload]
        };
      case 'EXPIRE_GAME_EVENT':
        return {
          ...state,
          gameEvents: state.gameEvents.map(event =>
            event.id === action.payload.eventId ? { ...event, isActive: false } : event
          )
        };
      case 'GIFT_ITEMS':
        const giftUpdatedUsers = state.users.map(user =>
          user.id === action.payload.userId
            ? {
                ...user,
                resources: {
                  oil: user.resources.oil + (action.payload.resources.oil || 0),
                  food: user.resources.food + (action.payload.resources.food || 0),
                  metals: user.resources.metals + (action.payload.resources.metals || 0),
                  weapons: user.resources.weapons + (action.payload.resources.weapons || 0),
                  soldiers: user.resources.soldiers + (action.payload.resources.soldiers || 0),
                  goods: user.resources.goods + (action.payload.resources.goods || 0),
                  aircraft: user.resources.aircraft + (action.payload.resources.aircraft || 0),
                  tanks: user.resources.tanks + (action.payload.resources.tanks || 0),
                  missiles: user.resources.missiles + (action.payload.resources.missiles || 0),
                  submarines: user.resources.submarines + (action.payload.resources.submarines || 0),
                  electricity: user.resources.electricity + (action.payload.resources.electricity || 0),
                  ships: user.resources.ships + (action.payload.resources.ships || 0),
                  defense: user.resources.defense + (action.payload.resources.defense || 0)
                },
                money: user.money + (action.payload.money || 0)
              }
            : user
        );
        return {
          ...state,
          users: giftUpdatedUsers,
          currentUser: state.currentUser?.id === action.payload.userId 
            ? giftUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser
            : state.currentUser
        };
      case 'REMOVE_ITEMS':
        const removeUpdatedUsers = state.users.map(user =>
          user.id === action.payload.userId
            ? {
                ...user,
                resources: {
                  oil: Math.max(0, user.resources.oil - (action.payload.resources.oil || 0)),
                  food: Math.max(0, user.resources.food - (action.payload.resources.food || 0)),
                  metals: Math.max(0, user.resources.metals - (action.payload.resources.metals || 0)),
                  weapons: Math.max(0, user.resources.weapons - (action.payload.resources.weapons || 0)),
                  soldiers: Math.max(0, user.resources.soldiers - (action.payload.resources.soldiers || 0)),
                  goods: Math.max(0, user.resources.goods - (action.payload.resources.goods || 0)),
                  aircraft: Math.max(0, user.resources.aircraft - (action.payload.resources.aircraft || 0)),
                  tanks: Math.max(0, user.resources.tanks - (action.payload.resources.tanks || 0)),
                  missiles: Math.max(0, user.resources.missiles - (action.payload.resources.missiles || 0)),
                  submarines: Math.max(0, user.resources.submarines - (action.payload.resources.submarines || 0)),
                  electricity: Math.max(0, user.resources.electricity - (action.payload.resources.electricity || 0)),
                  ships: Math.max(0, user.resources.ships - (action.payload.resources.ships || 0)),
                  defense: Math.max(0, user.resources.defense - (action.payload.resources.defense || 0))
                },
                money: Math.max(0, user.money - (action.payload.money || 0))
              }
            : user
        );
        return {
          ...state,
          users: removeUpdatedUsers,
          currentUser: state.currentUser?.id === action.payload.userId 
            ? removeUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser
            : state.currentUser
        };
      case 'UPDATE_MARKET_PRICES':
        // Adjust oil prices based on war/peace status
        const activeWars = state.wars.filter(w => w.status === 'active').length;
        const recentPeace = state.peaceProposals.filter(p => 
          p.status === 'accepted' && 
          new Date().getTime() - new Date(p.createdAt).getTime() < 24 * 60 * 60 * 1000
        ).length;
        
        let oilPriceModifier = 1;
        if (activeWars > 0) {
          oilPriceModifier = 1 + (activeWars * 0.1); // Increase oil price by 10% per active war
        }
        if (recentPeace > 0) {
          oilPriceModifier = Math.max(0.8, oilPriceModifier - (recentPeace * 0.05)); // Decrease oil price by 5% per recent peace
        }
        
        const adjustedPrices = {
          ...action.payload,
          oil: Math.round(action.payload.oil * oilPriceModifier)
        };
        
        return {
          ...state,
          gameSettings: {
            ...state.gameSettings,
            marketPrices: adjustedPrices
          }
        };
      case 'CREATE_TRADE_PROPOSAL':
        return {
          ...state,
          tradeProposals: [...state.tradeProposals, action.payload]
        };
      case 'ACCEPT_TRADE_PROPOSAL':
        const proposal = state.tradeProposals.find(p => p.id === action.payload.proposalId);
        if (!proposal) return state;

        const proposer = state.users.find(u => u.id === proposal.proposer);
        const buyer = state.users.find(u => u.id === action.payload.buyerId);
        if (!proposer || !buyer) return state;

        // Execute trade
        let updatedUsersAfterTrade = state.users.map(user => {
          if (user.id === proposal.proposer) {
            if (proposal.type === 'sell') {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposal.resourceType]: user.resources[proposal.resourceType] - proposal.amount
                },
                money: user.money + proposal.totalPrice
              };
            } else {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposal.resourceType]: user.resources[proposal.resourceType] + proposal.amount
                },
                money: user.money - proposal.totalPrice
              };
            }
          } else if (user.id === action.payload.buyerId) {
            if (proposal.type === 'sell') {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposal.resourceType]: user.resources[proposal.resourceType] + proposal.amount
                },
                money: user.money - proposal.totalPrice
              };
            } else {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposal.resourceType]: user.resources[proposal.resourceType] - proposal.amount
                },
                money: user.money + proposal.totalPrice
              };
            }
          }
          return user;
        });

        const updatedProposals = state.tradeProposals.map(p =>
          p.id === action.payload.proposalId ? { ...p, status: 'accepted' as const } : p
        );

        return {
          ...state,
          users: updatedUsersAfterTrade,
          tradeProposals: updatedProposals,
          currentUser: state.currentUser ? updatedUsersAfterTrade.find(u => u.id === state.currentUser.id) || state.currentUser : null
        };
      case 'CREATE_COUNTER_OFFER':
        const targetProposal = state.tradeProposals.find(p => p.id === action.payload.proposalId);
        if (!targetProposal) return state;

        const updatedProposalsWithCounter = state.tradeProposals.map(p =>
          p.id === action.payload.proposalId
            ? {
                ...p,
                status: 'countered' as const,
                counterOffers: [...(p.counterOffers || []), action.payload]
              }
            : p
        );

        return {
          ...state,
          tradeProposals: updatedProposalsWithCounter
        };
      case 'ACCEPT_COUNTER_OFFER':
        const proposalWithCounter = state.tradeProposals.find(p => p.id === action.payload.proposalId);
        const counterOffer = proposalWithCounter?.counterOffers?.find(c => c.id === action.payload.counterOfferId);
        
        if (!proposalWithCounter || !counterOffer) return state;

        // Execute counter offer trade
        const counterProposer = state.users.find(u => u.id === proposalWithCounter.proposer);
        const counterOfferer = state.users.find(u => u.id === counterOffer.counterOfferer);
        
        if (!counterProposer || !counterOfferer) return state;

        let updatedUsersAfterCounterTrade = state.users.map(user => {
          if (user.id === proposalWithCounter.proposer) {
            if (proposalWithCounter.type === 'sell') {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposalWithCounter.resourceType]: user.resources[proposalWithCounter.resourceType] - counterOffer.amount
                },
                money: user.money + counterOffer.totalPrice
              };
            } else {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposalWithCounter.resourceType]: user.resources[proposalWithCounter.resourceType] + counterOffer.amount
                },
                money: user.money - counterOffer.totalPrice
              };
            }
          } else if (user.id === counterOffer.counterOfferer) {
            if (proposalWithCounter.type === 'sell') {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposalWithCounter.resourceType]: user.resources[proposalWithCounter.resourceType] + counterOffer.amount
                },
                money: user.money - counterOffer.totalPrice
              };
            } else {
              return {
                ...user,
                resources: {
                  ...user.resources,
                  [proposalWithCounter.resourceType]: user.resources[proposalWithCounter.resourceType] - counterOffer.amount
                },
                money: user.money + counterOffer.totalPrice
              };
            }
          }
          return user;
        });

        const updatedProposalsAfterCounter = state.tradeProposals.map(p =>
          p.id === action.payload.proposalId ? { ...p, status: 'accepted' as const } : p
        );

        return {
          ...state,
          users: updatedUsersAfterCounterTrade,
          tradeProposals: updatedProposalsAfterCounter,
          currentUser: state.currentUser ? updatedUsersAfterCounterTrade.find(u => u.id === state.currentUser.id) || state.currentUser : null
        };
      case 'SELL_TO_ROBOT':
        const robotUpdatedUsers = state.users.map(user =>
          user.id === action.payload.userId
            ? {
                ...user,
                resources: {
                  ...user.resources,
                  [action.payload.resourceType]: user.resources[action.payload.resourceType as keyof typeof user.resources] - action.payload.amount
                },
                money: user.money + action.payload.totalPrice
              }
            : user
        );

        return {
          ...state,
          users: robotUpdatedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? robotUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser
            : state.currentUser
        };
      case 'CREATE_SUPPORT_REQUEST':
        return {
          ...state,
          supportRequests: [...state.supportRequests, action.payload]
        };
      case 'RESPOND_SUPPORT_REQUEST':
        const supportRequest = state.supportRequests.find(r => r.id === action.payload.requestId);
        if (!supportRequest || !action.payload.accepted) {
          return {
            ...state,
            supportRequests: state.supportRequests.map(r =>
              r.id === action.payload.requestId ? { ...r, status: action.payload.accepted ? 'accepted' : 'rejected' } : r
            )
          };
        }

        // Execute support transfer
        let updatedUsersAfterSupport = state.users.map(user => {
          if (user.id === supportRequest.sender) {
            if (supportRequest.type === 'economic') {
              return { ...user, money: user.money - supportRequest.amount };
            } else if (supportRequest.type === 'military' || supportRequest.type === 'resource' || supportRequest.type === 'goods') {
              const resourceType = supportRequest.resourceType as keyof typeof user.resources;
              if (resourceType && resourceType !== 'money') {
                return {
                  ...user,
                  resources: {
                    ...user.resources,
                    [resourceType]: user.resources[resourceType] - supportRequest.amount
                  }
                };
              }
            }
          } else if (user.id === supportRequest.recipient) {
            if (supportRequest.type === 'economic') {
              return { ...user, money: user.money + supportRequest.amount };
            } else if (supportRequest.type === 'military' || supportRequest.type === 'resource' || supportRequest.type === 'goods') {
              const resourceType = supportRequest.resourceType as keyof typeof user.resources;
              if (resourceType && resourceType !== 'money') {
                return {
                  ...user,
                  resources: {
                    ...user.resources,
                    [resourceType]: user.resources[resourceType] + supportRequest.amount
                  }
                };
              }
            }
          }
          return user;
        });

        return {
          ...state,
          users: updatedUsersAfterSupport,
          supportRequests: state.supportRequests.map(r =>
            r.id === action.payload.requestId ? { ...r, status: 'accepted' } : r
          ),
          currentUser: state.currentUser ? updatedUsersAfterSupport.find(u => u.id === state.currentUser.id) || state.currentUser : null
        };
      case 'CREATE_SUPPORT_TICKET':
        return {
          ...state,
          supportTickets: [...state.supportTickets, action.payload]
        };
      case 'RESPOND_SUPPORT_TICKET':
        return {
          ...state,
          supportTickets: state.supportTickets.map(ticket =>
            ticket.id === action.payload.ticketId
              ? { ...ticket, responses: [...ticket.responses, action.payload.response] }
              : ticket
          )
        };
      case 'CLOSE_SUPPORT_TICKET':
        return {
          ...state,
          supportTickets: state.supportTickets.map(ticket =>
            ticket.id === action.payload.ticketId ? { ...ticket, status: 'closed' } : ticket
          )
        };
      case 'CREATE_ALLIANCE':
        return {
          ...state,
          alliances: [...state.alliances, action.payload]
        };
      case 'CREATE_ALLIANCE_INVITATION':
        return {
          ...state,
          allianceInvitations: [...state.allianceInvitations, action.payload]
        };
      case 'RESPOND_ALLIANCE_INVITATION':
        const invitation = state.allianceInvitations.find(i => i.id === action.payload.invitationId);
        if (!invitation) return state;

        let newState = {
          ...state,
          allianceInvitations: state.allianceInvitations.map(i =>
            i.id === action.payload.invitationId 
              ? { ...i, status: action.payload.accepted ? 'accepted' as const : 'rejected' as const }
              : i
          )
        };

        if (action.payload.accepted) {
          // Check if alliance already exists or create new one
          const existingAlliance = newState.alliances.find(a => a.name === invitation.allianceName);
          if (existingAlliance) {
            // Add to existing alliance
            newState.alliances = newState.alliances.map(a =>
              a.id === existingAlliance.id
                ? { ...a, members: [...a.members, invitation.target] }
                : a
            );
          } else {
            // Create new alliance
            const newAlliance: Alliance = {
              id: Date.now().toString(),
              name: invitation.allianceName,
              members: [invitation.sender, invitation.target],
              leader: invitation.sender,
              createdAt: new Date()
            };
            newState.alliances = [...newState.alliances, newAlliance];
          }
        }

        return newState;
      case 'CREATE_TRADE':
        return {
          ...state,
          trades: [...state.trades, action.payload]
        };
      case 'DECLARE_WAR':
        // Check if attacker has shield protection
        const attacker = state.users.find(u => u.id === action.payload.aggressor);
        if (attacker?.countrySelectedAt) {
          const timeSinceSelection = Date.now() - new Date(attacker.countrySelectedAt).getTime();
          if (timeSinceSelection < state.gameSettings.shieldProtectionTime) {
            return state; // Cannot attack while under shield protection
          }
        }

        // Check if players are in alliance together
        const attackerAlliance = state.alliances.find(a => a.members.includes(action.payload.aggressor));
        const defenderAlliance = state.alliances.find(a => a.members.includes(action.payload.defender));
        if (attackerAlliance && defenderAlliance && attackerAlliance.id === defenderAlliance.id) {
          return state; // Cannot attack alliance members
        }

        // Deduct attack force from aggressor
        const warUpdatedUsers = state.users.map(user =>
          user.id === action.payload.aggressor
            ? {
                ...user,
                resources: {
                  ...user.resources,
                  soldiers: user.resources.soldiers - (action.payload.attackForce?.soldiers || 0),
                  tanks: user.resources.tanks - (action.payload.attackForce?.tanks || 0),
                  aircraft: user.resources.aircraft - (action.payload.attackForce?.aircraft || 0),
                  missiles: user.resources.missiles - (action.payload.attackForce?.missiles || 0),
                  submarines: user.resources.submarines - (action.payload.attackForce?.submarines || 0),
                  ships: user.resources.ships - (action.payload.attackForce?.ships || 0)
                }
              }
            : user
        );

        return {
          ...state,
          wars: [...state.wars, action.payload],
          users: warUpdatedUsers,
          currentUser: state.currentUser?.id === action.payload.aggressor
            ? warUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser
            : state.currentUser
        };
      case 'SEND_WAR_REINFORCEMENT':
        // Deduct reinforcement from sender
        const reinforcementUpdatedUsers = state.users.map(user =>
          user.id === action.payload.sender
            ? {
                ...user,
                resources: {
                  ...user.resources,
                  soldiers: user.resources.soldiers - action.payload.force.soldiers,
                  tanks: user.resources.tanks - action.payload.force.tanks,
                  aircraft: user.resources.aircraft - action.payload.force.aircraft,
                  missiles: user.resources.missiles - action.payload.force.missiles,
                  submarines: user.resources.submarines - action.payload.force.submarines,
                  ships: user.resources.ships - action.payload.force.ships
                }
              }
            : user
        );

        // Add reinforcement to war
        const reinforcementUpdatedWars = state.wars.map(war =>
          war.id === action.payload.warId
            ? {
                ...war,
                reinforcements: [...(war.reinforcements || []), action.payload]
              }
            : war
        );

        return {
          ...state,
          users: reinforcementUpdatedUsers,
          wars: reinforcementUpdatedWars,
          currentUser: state.currentUser?.id === action.payload.sender
            ? reinforcementUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser
            : state.currentUser
        };
      case 'RETREAT_FROM_WAR':
        return {
          ...state,
          wars: state.wars.map(war =>
            war.id === action.payload.warId ? { ...war, status: 'ended' as const, endTime: new Date() } : war
          )
        };
      case 'UPDATE_WAR_STATISTICS':
        return {
          ...state,
          wars: state.wars.map(war =>
            war.id === action.payload.warId 
              ? { ...war, battleStatistics: action.payload.statistics, status: 'ended' as const, endTime: new Date() }
              : war
          )
        };
      case 'APPLY_BATTLE_LOSSES':
        const battleUpdatedUsers = state.users.map(user => {
          if (user.id === action.payload.attackerId) {
            return {
              ...user,
              resources: {
                ...user.resources,
                soldiers: Math.max(0, user.resources.soldiers - action.payload.losses.attackerLosses.soldiers),
                tanks: Math.max(0, user.resources.tanks - action.payload.losses.attackerLosses.tanks),
                aircraft: Math.max(0, user.resources.aircraft - action.payload.losses.attackerLosses.aircraft),
                missiles: Math.max(0, user.resources.missiles - action.payload.losses.attackerLosses.missiles),
                submarines: Math.max(0, user.resources.submarines - action.payload.losses.attackerLosses.submarines),
                ships: Math.max(0, user.resources.ships - action.payload.losses.attackerLosses.ships)
              }
            };
          } else if (user.id === action.payload.defenderId) {
            return {
              ...user,
              resources: {
                ...user.resources,
                soldiers: Math.max(0, user.resources.soldiers - action.payload.losses.defenderLosses.soldiers),
                tanks: Math.max(0, user.resources.tanks - action.payload.losses.defenderLosses.tanks),
                aircraft: Math.max(0, user.resources.aircraft - action.payload.losses.defenderLosses.aircraft),
                missiles: Math.max(0, user.resources.missiles - action.payload.losses.defenderLosses.missiles),
                submarines: Math.max(0, user.resources.submarines - action.payload.losses.defenderLosses.submarines),
                ships: Math.max(0, user.resources.ships - action.payload.losses.defenderLosses.ships),
                defense: Math.max(0, user.resources.defense - (action.payload.losses.defenderLosses.defense || 0))
              }
            };
          }
          return user;
        });

        return {
          ...state,
          users: battleUpdatedUsers,
          currentUser: state.currentUser ? battleUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser : null
        };
      case 'CREATE_PEACE_PROPOSAL':
        return {
          ...state,
          peaceProposals: [...state.peaceProposals, action.payload]
        };
      case 'RESPOND_PEACE_PROPOSAL':
        const peaceProposal = state.peaceProposals.find(p => p.id === action.payload.proposalId);
        if (!peaceProposal) return state;

        let updatedWars = state.wars;
        if (action.payload.accepted) {
          // Find and update the war
          updatedWars = state.wars.map(war => {
            if ((war.aggressor === peaceProposal.proposer && war.defender === peaceProposal.target) ||
                (war.aggressor === peaceProposal.target && war.defender === peaceProposal.proposer)) {
              if (peaceProposal.type === 'peace') {
                return { ...war, status: 'ended' as const, endTime: new Date() };
              } else {
                // Ceasefire
                const ceasefireEndTime = new Date();
                ceasefireEndTime.setHours(ceasefireEndTime.getHours() + (peaceProposal.duration || 24));
                return { ...war, status: 'ceasefire' as const, ceasefireEndTime };
              }
            }
            return war;
          });
        }

        return {
          ...state,
          peaceProposals: state.peaceProposals.map(p =>
            p.id === action.payload.proposalId 
              ? { ...p, status: action.payload.accepted ? 'accepted' as const : 'rejected' as const }
              : p
          ),
          wars: updatedWars
        };
      case 'UPDATE_RESOURCES':
        const resourceUpdatedUsers = state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, resources: { ...user.resources, ...action.payload.resources } }
            : user
        );
        return {
          ...state,
          users: resourceUpdatedUsers,
          currentUser: state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, resources: { ...state.currentUser.resources, ...action.payload.resources } }
            : state.currentUser
        };
      case 'TRANSFER_RESOURCES':
        const transferUpdatedUsers = state.users.map(user => {
          if (user.id === action.payload.fromUserId) {
            return {
              ...user,
              resources: {
                oil: user.resources.oil - (action.payload.resources.oil || 0),
                food: user.resources.food - (action.payload.resources.food || 0),
                metals: user.resources.metals - (action.payload.resources.metals || 0),
                weapons: user.resources.weapons - (action.payload.resources.weapons || 0),
                soldiers: user.resources.soldiers - (action.payload.resources.soldiers || 0),
                goods: user.resources.goods - (action.payload.resources.goods || 0),
                aircraft: user.resources.aircraft - (action.payload.resources.aircraft || 0),
                tanks: user.resources.tanks - (action.payload.resources.tanks || 0),
                missiles: user.resources.missiles - (action.payload.resources.missiles || 0),
                submarines: user.resources.submarines - (action.payload.resources.submarines || 0),
                electricity: user.resources.electricity - (action.payload.resources.electricity || 0),
                ships: user.resources.ships - (action.payload.resources.ships || 0),
                defense: user.resources.defense - (action.payload.resources.defense || 0)
              },
              money: user.money - (action.payload.money || 0)
            };
          } else if (user.id === action.payload.toUserId) {
            return {
              ...user,
              resources: {
                oil: user.resources.oil + (action.payload.resources.oil || 0),
                food: user.resources.food + (action.payload.resources.food || 0),
                metals: user.resources.metals + (action.payload.resources.metals || 0),
                weapons: user.resources.weapons + (action.payload.resources.weapons || 0),
                soldiers: user.resources.soldiers + (action.payload.resources.soldiers || 0),
                goods: user.resources.goods + (action.payload.resources.goods || 0),
                aircraft: user.resources.aircraft + (action.payload.resources.aircraft || 0),
                tanks: user.resources.tanks + (action.payload.resources.tanks || 0),
                missiles: user.resources.missiles + (action.payload.resources.missiles || 0),
                submarines: user.resources.submarines + (action.payload.resources.submarines || 0),
                electricity: user.resources.electricity + (action.payload.resources.electricity || 0),
                ships: user.resources.ships + (action.payload.resources.ships || 0),
                defense: user.resources.defense + (action.payload.resources.defense || 0)
              },
              money: user.money + (action.payload.money || 0)
            };
          }
          return user;
        });
        return {
          ...state,
          users: transferUpdatedUsers,
          currentUser: state.currentUser ? transferUpdatedUsers.find(u => u.id === state.currentUser.id) || state.currentUser : null
        };
      case 'LOAD_DATA':
        return {
          ...state,
          ...action.payload
        };
      default:
        return state;
    }
  } catch (error) {
    console.error('Error in gameReducer:', error);
    return state; // Return current state on error to prevent crashes
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('worldWarGameData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Clear corrupted data
      localStorage.removeItem('worldWarGameData');
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        users: state.users,
        countries: state.countries,
        chatMessages: state.chatMessages,
        alliances: state.alliances,
        trades: state.trades,
        wars: state.wars,
        tradeProposals: state.tradeProposals,
        supportRequests: state.supportRequests,
        supportTickets: state.supportTickets,
        gameEvents: state.gameEvents,
        peaceProposals: state.peaceProposals,
        allianceInvitations: state.allianceInvitations,
        userReports: state.userReports,
        notifications: state.notifications,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        gameSettings: state.gameSettings,
        unreadChatCount: state.unreadChatCount
      };
      localStorage.setItem('worldWarGameData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [state]);

  // Auto-expire events and timeouts
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const now = new Date();
        
        // Expire events
        state.gameEvents.forEach(event => {
          if (event.isActive && new Date(event.expiresAt) <= now) {
            dispatch({ type: 'EXPIRE_GAME_EVENT', payload: { eventId: event.id } });
          }
        });

        // Auto-end ceasefires
        state.wars.forEach(war => {
          if (war.status === 'ceasefire' && war.ceasefireEndTime && new Date(war.ceasefireEndTime) <= now) {
            dispatch({ type: 'LOAD_DATA', payload: {
              wars: state.wars.map(w => 
                w.id === war.id ? { ...w, status: 'active' as const, ceasefireEndTime: undefined } : w
              )
            }});
          }
        });

        // Auto-unmute users
        state.users.forEach(user => {
          if (user.isMuted && user.muteExpiresAt && new Date(user.muteExpiresAt) <= now) {
            dispatch({ type: 'UNMUTE_USER', payload: { userId: user.id } });
          }
          if (user.isTimedOut && user.timeoutExpiresAt && new Date(user.timeoutExpiresAt) <= now) {
            dispatch({ type: 'REMOVE_TIMEOUT', payload: { userId: user.id } });
          }
        });

        // Expire notifications
        state.notifications.forEach(notification => {
          if (notification.expiresAt && new Date(notification.expiresAt) <= now) {
            dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId: notification.id } });
          }
        });
      } catch (error) {
        console.error('Error in auto-expire interval:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.gameEvents, state.wars, state.users, state.notifications]);

  // Auto-update market prices daily
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const newPrices = {
          oil: Math.max(5, state.gameSettings.marketPrices.oil + Math.floor(Math.random() * 6) - 3),
          food: Math.max(3, state.gameSettings.marketPrices.food + Math.floor(Math.random() * 4) - 2),
          metals: Math.max(8, state.gameSettings.marketPrices.metals + Math.floor(Math.random() * 8) - 4),
          weapons: Math.max(15, state.gameSettings.marketPrices.weapons + Math.floor(Math.random() * 10) - 5),
          soldiers: Math.max(2, state.gameSettings.marketPrices.soldiers + Math.floor(Math.random() * 3) - 1),
          goods: Math.max(6, state.gameSettings.marketPrices.goods + Math.floor(Math.random() * 6)- 3),
          aircraft: Math.max(300, state.gameSettings.marketPrices.aircraft + Math.floor(Math.random() * 200) - 100),
          tanks: Math.max(200, state.gameSettings.marketPrices.tanks + Math.floor(Math.random() * 100) - 50),
          missiles: Math.max(150, state.gameSettings.marketPrices.missiles + Math.floor(Math.random() * 100) - 50),
          submarines: Math.max(800, state.gameSettings.marketPrices.submarines + Math.floor(Math.random() * 400) - 200),
          electricity: Math.max(1, state.gameSettings.marketPrices.electricity + Math.floor(Math.random() * 2) - 1),
          ships: Math.max(600, state.gameSettings.marketPrices.ships + Math.floor(Math.random() * 400) - 200),
          defense: Math.max(50, state.gameSettings.marketPrices.defense + Math.floor(Math.random() * 50) - 25)
        };
        dispatch({ type: 'UPDATE_MARKET_PRICES', payload: newPrices });
      } catch (error) {
        console.error('Error updating market prices:', error);
      }
    }, 24 * 60 * 60 * 1000); // Update daily

    return () => clearInterval(interval);
  }, [state.gameSettings.marketPrices]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};