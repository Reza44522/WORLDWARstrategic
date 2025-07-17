import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { TrendingUp, DollarSign, Package, Send, CheckCircle, X, Bot, MessageCircle, Plus } from 'lucide-react';
import { TradeProposal, CounterOffer } from '../../types';

const MarketTrading: React.FC = () => {
  const { state, dispatch } = useGame();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('sell');
  const [resourceType, setResourceType] = useState<keyof typeof state.currentUser.resources>('oil');
  const [amount, setAmount] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [robotSellAmount, setRobotSellAmount] = useState(0);
  const [robotSellResource, setRobotSellResource] = useState<keyof typeof state.currentUser.resources>('oil');
  const [counterOfferAmount, setCounterOfferAmount] = useState(0);
  const [counterOfferPrice, setCounterOfferPrice] = useState(0);
  const [counterOfferMessage, setCounterOfferMessage] = useState('');
  const [selectedProposal, setSelectedProposal] = useState('');

  if (!state.currentUser?.country) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white" dir="rtl">ابتدا کشور خود را انتخاب کنید</p>
      </div>
    );
  }

  const resourceNames = {
    oil: 'نفت',
    food: 'غذا',
    metals: 'فلزات',
    weapons: 'سلاح',
    soldiers: 'سرباز',
    goods: 'کالا',
    tanks: 'تانک',
    aircraft: 'هواپیما',
    missiles: 'موشک',
    submarines: 'زیردریایی',
    ships: 'کشتی',
    electricity: 'برق'
  };

  const activeProposals = state.tradeProposals.filter(p => p.status === 'active');
  const myProposals = state.tradeProposals.filter(p => p.proposer === state.currentUser?.id);

  const handleCreateProposal = () => {
    if (amount <= 0 || pricePerUnit <= 0) {
      alert('لطفاً مقادیر معتبر وارد کنید');
      return;
    }

    if (tradeType === 'sell' && amount > state.currentUser!.resources[resourceType]) {
      alert('مقدار وارد شده بیش از منابع موجود است');
      return;
    }

    if (tradeType === 'buy' && (amount * pricePerUnit) > state.currentUser!.money) {
      alert('پول کافی برای این خرید ندارید');
      return;
    }

    const proposal: TradeProposal = {
      id: Date.now().toString(),
      proposer: state.currentUser!.id,
      proposerName: state.currentUser!.username,
      type: tradeType,
      resourceType,
      amount,
      pricePerUnit,
      totalPrice: amount * pricePerUnit,
      status: 'active',
      createdAt: new Date(),
      counterOffers: []
    };

    dispatch({ type: 'CREATE_TRADE_PROPOSAL', payload: proposal });
    
    // Reset form
    setAmount(0);
    setPricePerUnit(0);
    
    alert('پیشنهاد معامله ایجاد شد');
  };

  const handleAcceptProposal = (proposalId: string) => {
    const proposal = state.tradeProposals.find(p => p.id === proposalId);
    if (!proposal) return;

    if (proposal.type === 'sell') {
      // Buying from someone
      if (state.currentUser!.money < proposal.totalPrice) {
        alert('پول کافی ندارید');
        return;
      }
    } else {
      // Selling to someone
      if (state.currentUser!.resources[proposal.resourceType] < proposal.amount) {
        alert('منابع کافی ندارید');
        return;
      }
    }

    dispatch({ 
      type: 'ACCEPT_TRADE_PROPOSAL', 
      payload: { proposalId, buyerId: state.currentUser!.id } 
    });
    
    alert('معامله انجام شد');
  };

  const handleSellToRobot = () => {
    if (robotSellAmount <= 0) {
      alert('لطفاً مقدار معتبر وارد کنید');
      return;
    }

    if (robotSellAmount > state.currentUser!.resources[robotSellResource]) {
      alert('مقدار وارد شده بیش از منابع موجود است');
      return;
    }

    const marketPrice = state.gameSettings.marketPrices[robotSellResource];
    const robotPrice = Math.floor(marketPrice * (state.gameSettings.robotBuybackPercentage / 100));
    const totalPrice = robotSellAmount * robotPrice;

    dispatch({
      type: 'SELL_TO_ROBOT',
      payload: {
        userId: state.currentUser!.id,
        resourceType: robotSellResource,
        amount: robotSellAmount,
        totalPrice
      }
    });

    setRobotSellAmount(0);
    alert(`شما ${robotSellAmount.toLocaleString()} ${resourceNames[robotSellResource]} فروختید و ${totalPrice.toLocaleString()} WD دریافت کردید`);
  };

  const handleCreateCounterOffer = () => {
    if (!selectedProposal || counterOfferAmount <= 0 || counterOfferPrice <= 0) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    const proposal = state.tradeProposals.find(p => p.id === selectedProposal);
    if (!proposal) return;

    const counterOffer: CounterOffer = {
      id: Date.now().toString(),
      proposalId: selectedProposal,
      counterOfferer: state.currentUser!.id,
      counterOffererName: state.currentUser!.username,
      amount: counterOfferAmount,
      pricePerUnit: counterOfferPrice,
      totalPrice: counterOfferAmount * counterOfferPrice,
      message: counterOfferMessage.trim() || undefined,
      status: 'pending',
      createdAt: new Date()
    };

    dispatch({ type: 'CREATE_COUNTER_OFFER', payload: counterOffer });
    
    // Reset form
    setSelectedProposal('');
    setCounterOfferAmount(0);
    setCounterOfferPrice(0);
    setCounterOfferMessage('');
    
    alert('پیشنهاد متقابل ارسال شد');
  };

  const handleAcceptCounterOffer = (proposalId: string, counterOfferId: string) => {
    dispatch({ 
      type: 'ACCEPT_COUNTER_OFFER', 
      payload: { proposalId, counterOfferId } 
    });
    
    alert('پیشنهاد متقابل پذیرفته شد');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2" dir="rtl">بازار معاملات</h3>
        <p className="text-gray-300" dir="rtl">منابع خود را خرید و فروش کنید</p>
      </div>

      {/* Sell to Robot */}
      <div className="bg-purple-600/20 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
          <Bot className="w-6 h-6" />
          <span>فروش به ربات</span>
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                نوع منبع:
              </label>
              <select
                value={robotSellResource}
                onChange={(e) => setRobotSellResource(e.target.value as keyof typeof state.currentUser.resources)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                {Object.entries(resourceNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                مقدار:
              </label>
              <input
                type="number"
                value={robotSellAmount}
                onChange={(e) => setRobotSellAmount(parseInt(e.target.value) || 0)}
                min="1"
                max={state.currentUser?.resources[robotSellResource]}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              />
              <div className="text-xs text-gray-400 mt-1" dir="rtl">
                موجود: {state.currentUser?.resources[robotSellResource].toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-blue-600/20 rounded-lg p-3">
            <div className="flex justify-between items-center text-white" dir="rtl">
              <span>قیمت ربات ({state.gameSettings.robotBuybackPercentage}% قیمت بازار):</span>
              <span className="font-bold">
                {Math.floor(state.gameSettings.marketPrices[robotSellResource] * (state.gameSettings.robotBuybackPercentage / 100))} WD
              </span>
            </div>
            <div className="flex justify-between items-center text-white mt-1" dir="rtl">
              <span>مجموع دریافتی:</span>
              <span className="font-bold text-xl">
                {(robotSellAmount * Math.floor(state.gameSettings.marketPrices[robotSellResource] * (state.gameSettings.robotBuybackPercentage / 100))).toLocaleString()} WD
              </span>
            </div>
          </div>

          <button
            onClick={handleSellToRobot}
            disabled={robotSellAmount <= 0 || robotSellAmount > state.currentUser!.resources[robotSellResource]}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Bot className="w-5 h-5" />
            <span>فروش به ربات</span>
          </button>
        </div>
      </div>

      {/* Create Trade Proposal */}
      <div className="bg-white/10 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">ایجاد پیشنهاد معامله</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              نوع معامله:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  tradeType === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                فروش
              </button>
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  tradeType === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                خرید
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              نوع منبع:
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as keyof typeof state.currentUser.resources)}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
              dir="rtl"
            >
              {Object.entries(resourceNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                مقدار:
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              />
              {tradeType === 'sell' && (
                <div className="text-xs text-gray-400 mt-1" dir="rtl">
                  موجود: {state.currentUser?.resources[resourceType].toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                قیمت هر واحد (WD):
              </label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              />
              <div className="text-xs text-gray-400 mt-1" dir="rtl">
                قیمت بازار: {state.gameSettings.marketPrices[resourceType]} WD
              </div>
            </div>
          </div>

          <div className="bg-blue-600/20 rounded-lg p-3">
            <div className="flex justify-between items-center text-white" dir="rtl">
              <span>قیمت کل:</span>
              <span className="font-bold text-xl">{(amount * pricePerUnit).toLocaleString()} WD</span>
            </div>
          </div>

          <button
            onClick={handleCreateProposal}
            disabled={amount <= 0 || pricePerUnit <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>ایجاد پیشنهاد</span>
          </button>
        </div>
      </div>

      {/* Counter Offer */}
      <div className="bg-orange-600/20 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2" dir="rtl">
          <MessageCircle className="w-6 h-6" />
          <span>پیشنهاد متقابل (چونه زدن)</span>
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              انتخاب پیشنهاد:
            </label>
            <select
              value={selectedProposal}
              onChange={(e) => setSelectedProposal(e.target.value)}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
              dir="rtl"
            >
              <option value="">پیشنهاد مورد نظر را انتخاب کنید</option>
              {activeProposals.filter(p => p.proposer !== state.currentUser?.id).map((proposal) => {
                const proposer = state.users.find(u => u.id === proposal.proposer);
                return (
                  <option key={proposal.id} value={proposal.id}>
                    {proposal.type === 'sell' ? 'فروش' : 'خرید'} {proposal.amount.toLocaleString()} {resourceNames[proposal.resourceType]} 
                    توسط {proposer?.username} - {proposal.pricePerUnit.toLocaleString()} WD
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                مقدار پیشنهادی:
              </label>
              <input
                type="number"
                value={counterOfferAmount}
                onChange={(e) => setCounterOfferAmount(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
                قیمت پیشنهادی (WD):
              </label>
              <input
                type="number"
                value={counterOfferPrice}
                onChange={(e) => setCounterOfferPrice(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" dir="rtl">
              پیام (اختیاری):
            </label>
            <textarea
              value={counterOfferMessage}
              onChange={(e) => setCounterOfferMessage(e.target.value)}
              rows={2}
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
              placeholder="پیام خود را بنویسید..."
              dir="rtl"
            />
          </div>

          <div className="bg-blue-600/20 rounded-lg p-3">
            <div className="flex justify-between items-center text-white" dir="rtl">
              <span>قیمت کل پیشنهادی:</span>
              <span className="font-bold text-xl">{(counterOfferAmount * counterOfferPrice).toLocaleString()} WD</span>
            </div>
          </div>

          <button
            onClick={handleCreateCounterOffer}
            disabled={!selectedProposal || counterOfferAmount <= 0 || counterOfferPrice <= 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>ارسال پیشنهاد متقابل</span>
          </button>
        </div>
      </div>

      {/* Active Proposals */}
      <div className="bg-white/10 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4" dir="rtl">پیشنهادات فعال</h4>
        
        <div className="space-y-3">
          {activeProposals.filter(p => p.proposer !== state.currentUser?.id).map((proposal) => {
            const proposer = state.users.find(u => u.id === proposal.proposer);
            const proposerCountry = proposer?.country ? state.countries.find(c => c.id === proposer.country) : null;
            
            return (
              <div key={proposal.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2" dir="rtl">
                    {proposerCountry && <span className="text-xl">{proposerCountry.flag}</span>}
                    <div>
                      <div className="font-bold text-white">{proposer?.username}</div>
                      <div className="text-sm text-gray-300">
                        {proposal.type === 'sell' ? 'می‌فروشد' : 'می‌خرد'}: {proposal.amount.toLocaleString()} {resourceNames[proposal.resourceType]}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">
                      {proposal.pricePerUnit.toLocaleString()} WD / واحد
                    </div>
                    <div className="text-sm text-gray-300">
                      کل: {proposal.totalPrice.toLocaleString()} WD
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(proposal.createdAt).toLocaleString('fa-IR')}
                </div>

                {/* Show counter offers */}
                {proposal.counterOffers && proposal.counterOffers.length > 0 && (
                  <div className="mb-3 bg-white/5 rounded-lg p-3">
                    <h5 className="font-bold text-white mb-2" dir="rtl">پیشنهادات متقابل:</h5>
                    <div className="space-y-2">
                      {proposal.counterOffers.map((counterOffer) => (
                        <div key={counterOffer.id} className="text-sm bg-white/5 rounded p-2">
                          <div className="flex justify-between items-start" dir="rtl">
                            <div>
                              <div className="font-bold text-white">{counterOffer.counterOffererName}</div>
                              <div className="text-gray-300">
                                {counterOffer.amount.toLocaleString()} واحد - {counterOffer.pricePerUnit.toLocaleString()} WD
                              </div>
                              {counterOffer.message && (
                                <div className="text-gray-400 text-xs mt-1">{counterOffer.message}</div>
                              )}
                            </div>
                            {proposal.proposer === state.currentUser?.id && counterOffer.status === 'pending' && (
                              <button
                                onClick={() => handleAcceptCounterOffer(proposal.id, counterOffer.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                              >
                                پذیرش
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptProposal(proposal.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{proposal.type === 'sell' ? 'خرید' : 'فروش'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal.id);
                      setCounterOfferAmount(proposal.amount);
                      setCounterOfferPrice(proposal.pricePerUnit);
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>چونه زدن</span>
                  </button>
                </div>
              </div>
            );
          })}
          
          {activeProposals.filter(p => p.proposer !== state.currentUser?.id).length === 0 && (
            <div className="text-center text-gray-400 py-8" dir="rtl">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>پیشنهاد معامله‌ای وجود ندارد</p>
            </div>
          )}
        </div>
      </div>

      {/* My Proposals */}
      {myProposals.length > 0 && (
        <div className="bg-white/10 rounded-lg p-6">
          <h4 className="text-xl font-bold text-white mb-4" dir="rtl">پیشنهادات من</h4>
          
          <div className="space-y-3">
            {myProposals.map((proposal) => (
              <div key={proposal.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center" dir="rtl">
                  <div>
                    <div className="font-bold text-white">
                      {proposal.type === 'sell' ? 'فروش' : 'خرید'}: {proposal.amount.toLocaleString()} {resourceNames[proposal.resourceType]}
                    </div>
                    <div className="text-sm text-gray-300">
                      {proposal.pricePerUnit.toLocaleString()} WD / واحد - کل: {proposal.totalPrice.toLocaleString()} WD
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    proposal.status === 'active' 
                      ? 'bg-green-600/20 text-green-400'
                      : proposal.status === 'countered'
                      ? 'bg-orange-600/20 text-orange-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {proposal.status === 'active' ? 'فعال' : 
                     proposal.status === 'countered' ? 'پیشنهاد متقابل' : 'تکمیل شده'}
                  </span>
                </div>

                {/* Show counter offers for my proposals */}
                {proposal.counterOffers && proposal.counterOffers.length > 0 && (
                  <div className="mt-3 bg-white/5 rounded-lg p-3">
                    <h5 className="font-bold text-white mb-2" dir="rtl">پیشنهادات متقابل:</h5>
                    <div className="space-y-2">
                      {proposal.counterOffers.map((counterOffer) => (
                        <div key={counterOffer.id} className="text-sm bg-white/5 rounded p-2">
                          <div className="flex justify-between items-start" dir="rtl">
                            <div>
                              <div className="font-bold text-white">{counterOffer.counterOffererName}</div>
                              <div className="text-gray-300">
                                {counterOffer.amount.toLocaleString()} واحد - {counterOffer.pricePerUnit.toLocaleString()} WD
                              </div>
                              {counterOffer.message && (
                                <div className="text-gray-400 text-xs mt-1">{counterOffer.message}</div>
                              )}
                            </div>
                            {counterOffer.status === 'pending' && (
                              <button
                                onClick={() => handleAcceptCounterOffer(proposal.id, counterOffer.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                              >
                                پذیرش
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrading;