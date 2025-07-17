import React, { useState } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { Music, Plus, Trash2, Play, Pause, Volume2, VolumeX, Save, X, Edit3 } from 'lucide-react';
import { MusicTrack } from '../../types';

const MusicManagement: React.FC = () => {
  const { state, dispatch } = useAudio();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    url: ''
  });

  const handleAddTrack = () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      alert('لطفاً عنوان و لینک آهنگ را وارد کنید');
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      alert('لینک وارد شده معتبر نیست');
      return;
    }

    const newTrack: MusicTrack = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      artist: formData.artist.trim() || 'نامشخص',
      url: formData.url.trim(),
      duration: 0,
      uploadedBy: 'admin',
      uploadedAt: new Date(),
      isActive: true
    };

    dispatch({ type: 'ADD_MUSIC_TRACK', payload: newTrack });
    
    // Reset form
    setFormData({ title: '', artist: '', url: '' });
    setShowAddForm(false);
    
    alert('آهنگ با موفقیت اضافه شد');
  };

  const handleEditTrack = (trackId: string) => {
    const track = state.musicTracks.find(t => t.id === trackId);
    if (track) {
      setFormData({
        title: track.title,
        artist: track.artist,
        url: track.url
      });
      setEditingTrack(trackId);
      setShowAddForm(true);
    }
  };

  const handleUpdateTrack = () => {
    if (!formData.title.trim() || !formData.url.trim() || !editingTrack) {
      alert('لطفاً عنوان و لینک آهنگ را وارد کنید');
      return;
    }

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      alert('لینک وارد شده معتبر نیست');
      return;
    }

    const updatedTrack: MusicTrack = {
      id: editingTrack,
      title: formData.title.trim(),
      artist: formData.artist.trim() || 'نامشخص',
      url: formData.url.trim(),
      duration: 0,
      uploadedBy: 'admin',
      uploadedAt: new Date(),
      isActive: true
    };

    // Remove old track and add updated one
    dispatch({ type: 'REMOVE_MUSIC_TRACK', payload: { trackId: editingTrack } });
    dispatch({ type: 'ADD_MUSIC_TRACK', payload: updatedTrack });
    
    // Reset form
    setFormData({ title: '', artist: '', url: '' });
    setShowAddForm(false);
    setEditingTrack(null);
    
    alert('آهنگ با موفقیت ویرایش شد');
  };

  const handleRemoveTrack = (trackId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این آهنگ را حذف کنید؟')) {
      dispatch({ type: 'REMOVE_MUSIC_TRACK', payload: { trackId } });
      alert('آهنگ حذف شد');
    }
  };

  const handleCancelEdit = () => {
    setFormData({ title: '', artist: '', url: '' });
    setShowAddForm(false);
    setEditingTrack(null);
  };

  const updateMusicSettings = (settings: any) => {
    dispatch({ type: 'UPDATE_MUSIC_SETTINGS', payload: settings });
  };

  const updateAlertSettings = (settings: any) => {
    dispatch({ type: 'UPDATE_ALERT_SETTINGS', payload: settings });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2" dir="rtl">
          <Music className="w-8 h-8 text-blue-400" />
          <span>مدیریت موزیک</span>
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن آهنگ</span>
        </button>
      </div>

      {/* Music Settings */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">تنظیمات پخش موزیک</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between" dir="rtl">
              <span className="text-white font-medium">فعال/غیرفعال کردن موزیک:</span>
              <button
                onClick={() => updateMusicSettings({ isEnabled: !state.musicSettings.isEnabled })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  state.musicSettings.isEnabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {state.musicSettings.isEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>فعال</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>غیرفعال</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between" dir="rtl">
              <span className="text-white font-medium">پخش خودکار:</span>
              <button
                onClick={() => updateMusicSettings({ autoPlay: !state.musicSettings.autoPlay })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.musicSettings.autoPlay
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {state.musicSettings.autoPlay ? 'فعال' : 'غیرفعال'}
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2" dir="rtl">
                صدا: {Math.round(state.musicSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.musicSettings.volume}
                onChange={(e) => updateMusicSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between" dir="rtl">
              <span className="text-white font-medium">تکرار:</span>
              <select
                value={state.musicSettings.repeat}
                onChange={(e) => updateMusicSettings({ repeat: e.target.value })}
                className="bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              >
                <option value="none">بدون تکرار</option>
                <option value="one">تکرار یک آهنگ</option>
                <option value="all">تکرار همه</option>
              </select>
            </div>

            <div className="flex items-center justify-between" dir="rtl">
              <span className="text-white font-medium">پخش تصادفی:</span>
              <button
                onClick={() => updateMusicSettings({ shuffle: !state.musicSettings.shuffle })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.musicSettings.shuffle
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {state.musicSettings.shuffle ? 'فعال' : 'غیرفعال'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">تنظیمات آژیر هشدار</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between" dir="rtl">
              <span className="text-white font-medium">فعال/غیرفعال کردن آژیر:</span>
              <button
                onClick={() => updateAlertSettings({ isEnabled: !state.alertSettings.isEnabled })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.alertSettings.isEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {state.alertSettings.isEnabled ? 'فعال' : 'غیرفعال'}
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2" dir="rtl">
                لینک فایل آژیر:
              </label>
              <input
                type="url"
                value={state.alertSettings.alertSoundUrl}
                onChange={(e) => updateAlertSettings({ alertSoundUrl: e.target.value })}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="https://example.com/alarm.mp3"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2" dir="rtl">
                صدای آژیر: {Math.round(state.alertSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.alertSettings.volume}
                onChange={(e) => updateAlertSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2" dir="rtl">
                مدت نمایش هشدار (ثانیه):
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={state.alertSettings.alertDuration}
                onChange={(e) => updateAlertSettings({ alertDuration: parseInt(e.target.value) || 5 })}
                className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                dir="rtl"
              />
            </div>

            <div className="flex items-center justify-between" dir="rtl">
              <span className="text-white font-medium">نمایش هشدار بصری:</span>
              <button
                onClick={() => updateAlertSettings({ showVisualAlert: !state.alertSettings.showVisualAlert })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.alertSettings.showVisualAlert
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {state.alertSettings.showVisualAlert ? 'فعال' : 'غیرفعال'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Track Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white" dir="rtl">
                {editingTrack ? 'ویرایش آهنگ' : 'افزودن آهنگ جدید'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  عنوان آهنگ:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="نام آهنگ..."
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  نام خواننده (اختیاری):
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="نام خواننده..."
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  لینک مستقیم آهنگ (MP3):
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="https://example.com/song.mp3"
                  dir="ltr"
                />
                <p className="text-xs text-gray-400 mt-1" dir="rtl">
                  لینک باید مستقیم به فایل MP3 باشد
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={editingTrack ? handleUpdateTrack : handleAddTrack}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingTrack ? 'ویرایش' : 'افزودن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music Tracks List */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
          لیست آهنگ‌ها ({state.musicTracks.length})
        </h3>

        {state.musicTracks.length === 0 ? (
          <div className="text-center text-gray-400 py-8" dir="rtl">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>هنوز آهنگی اضافه نشده است</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.musicTracks.map((track, index) => (
              <div
                key={track.id}
                className={`bg-white/5 rounded-lg p-4 flex items-center justify-between ${
                  index === state.currentTrackIndex ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3" dir="rtl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === state.currentTrackIndex && state.isPlaying
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`}>
                    {index === state.currentTrackIndex && state.isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">{track.title}</div>
                    <div className="text-sm text-gray-400">{track.artist}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTrack(track.id)}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded transition-colors"
                    title="ویرایش"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4" dir="rtl">وضعیت فعلی</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {state.musicTracks.length}
            </div>
            <div className="text-sm text-gray-300">آهنگ موجود</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
              {state.isPlaying ? 'در حال پخش' : 'متوقف'}
            </div>
            <div className="text-sm text-gray-300">وضعیت پخش</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${state.musicSettings.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {state.musicSettings.isEnabled ? 'فعال' : 'غیرفعال'}
            </div>
            <div className="text-sm text-gray-300">سیستم موزیک</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicManagement;