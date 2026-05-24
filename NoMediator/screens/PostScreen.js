import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Switch, Alert, ActivityIndicator,
  Image, Modal, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STEPS = ['Basic Info', 'Details', 'Amenities'];

export default function PostScreen({ navigation }) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [bhk, setBhk] = useState('2 BHK');
  const [sqft, setSqft] = useState('');
  const [type, setType] = useState('Full House');
  const [furnished, setFurnished] = useState('Semi-furnished');
  const [parking, setParking] = useState(false);
  const [gym, setGym] = useState(false);
  const [lift, setLift] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [security, setSecurity] = useState(true);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Map / Autocomplete Location selector states
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629, label: 'India' });
  const [tempLocation, setTempLocation] = useState('');

  // Media Picker states
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);

  // Fetch current location on mount or when token is present
  useEffect(() => {
    if (token) {
      fetchCurrentLocation();
    }
  }, [token]);

  const fetchCurrentLocation = async () => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'NoMediatorApp/1.0'
              }
            });
            const data = await res.json();
            if (data.display_name) {
              setMapCenter({
                lat: latitude,
                lng: longitude,
                label: data.display_name
              });
            } else {
              setMapCenter({
                lat: latitude,
                lng: longitude,
                label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
              });
            }
          } catch (e) {
            console.warn('Reverse geocode failed:', e);
            setMapCenter({
              lat: latitude,
              lng: longitude,
              label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
            });
          }
        },
        async (error) => {
          console.warn('Browser geolocation failed, using IP geolocation:', error);
          await fetchIpLocation();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    } else {
      await fetchIpLocation();
    }
  };

  const fetchIpLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.city) {
        const nearestLoc = `${data.org || 'Nearest Area'}, ${data.city}, ${data.region}, India`;
        setMapCenter({
          lat: data.latitude || 20.5937,
          lng: data.longitude || 78.9629,
          label: nearestLoc
        });
      }
    } catch (e) {
      console.warn('Failed to get IP location:', e);
    }
  };

  const fetchReverseGeocode = async (lat, lng) => {
    const fallbackAddr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setTempLocation(fallbackAddr);
    setMapCenter({ lat, lng, label: fallbackAddr });

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NoMediatorApp/1.0'
        }
      });
      const data = await res.json();
      if (data.display_name) {
        setTempLocation(data.display_name);
        setMapCenter({ lat, lng, label: data.display_name });
      }
    } catch (e) {
      console.warn('Failed to reverse geocode:', e);
    }
  };

  useEffect(() => {
    const handleMapMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'location_selected') {
          fetchReverseGeocode(data.lat, data.lng);
        }
      } catch (e) {}
    };

    if (Platform.OS === 'web') {
      window.addEventListener('message', handleMapMessage);
      return () => window.removeEventListener('message', handleMapMessage);
    }
  }, []);

  const handleSearchSuggestions = async (text) => {
    setSearchQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=in&limit=5`);
      const data = await res.json();
      setSuggestions(data.map(item => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      })));
    } catch (e) {
      console.warn('Failed to fetch suggestions:', e);
    }
  };

  const selectSuggestion = (item) => {
    setTempLocation(item.label);
    setMapCenter({ lat: item.lat, lng: item.lng, label: item.label });
    setSuggestions([]);
    setSearchQuery('');
    
    if (Platform.OS === 'web') {
      const iframe = document.getElementById('map-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          type: 'update_position',
          lat: item.lat,
          lng: item.lng,
          label: item.label
        }), '*');
      }
    }
  };

  const confirmLocation = () => {
    if (tempLocation) {
      setLocation(tempLocation);
    }
    setMapModalVisible(false);
  };

  // Image & Video selection helpers
  const uriToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Failed to convert URI to base64:", e);
      return uri;
    }
  };

  const pickMedia = () => {
    setMediaModalVisible(true);
  };

  const pickImages = async () => {
    setMediaModalVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need media library permissions!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10 - images.length,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled) {
        const promises = result.assets.map(async (asset) => {
          if (asset.base64) {
            let b64 = asset.base64;
            if (!b64.startsWith('data:')) {
              b64 = `data:image/jpeg;base64,${b64}`;
            }
            return b64;
          }
          return await uriToBase64(asset.uri);
        });
        const resolvedBase64s = await Promise.all(promises);
        setImages(prev => [...prev, ...resolvedBase64s].slice(0, 10));
      }
    } catch (e) {
      console.warn("Error picking images:", e);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const pickVideo = async () => {
    setMediaModalVisible(false);
    if (videos.length >= 1) {
      Alert.alert('Limit Reached', 'You can only upload 1 video.');
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need media library permissions!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const base64Video = await uriToBase64(asset.uri);
        setVideos([base64Video]);
      }
    } catch (e) {
      console.warn("Error picking video:", e);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, idx) => idx !== index));
  };

  const next = () => {
    if (step === 0 && (!title || !location)) { Alert.alert('Required', 'Please fill title and location'); return; }
    if (step === 1 && !price) { Alert.alert('Required', 'Please enter rent amount'); return; }
    if (step < 2) setStep(step + 1);
    else handlePost();
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      const locationParts = location.split(',').map(p => p.trim());
      const area = locationParts[0] || location;
      
      let detectedCity = 'Bengaluru';
      const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];
      for (const part of locationParts) {
        const found = CITIES.find(c => c.toLowerCase() === part.toLowerCase());
        if (found) {
          detectedCity = found;
          break;
        }
      }

      const gradients = [
        { start: '#E8121A', end: '#FF6F00' },
        { start: '#1565C0', end: '#00897B' },
        { start: '#6A1B9A', end: '#E8121A' },
        { start: '#2E7D32', end: '#1565C0' },
        { start: '#FF6F00', end: '#E8121A' }
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const propertyData = {
        title,
        location,
        area,
        city: detectedCity,
        price: Number(price),
        deposit: Number(deposit || 0),
        bhk,
        sqft: Number(sqft || 0),
        beds: parseInt(bhk) || 1,
        baths: parseInt(bhk) || 1,
        type,
        furnished,
        parking,
        petFriendly,
        gym,
        lift,
        security,
        colorStart: randomGradient.start,
        colorEnd: randomGradient.end,
        tag: petFriendly ? 'Pet Friendly' : 'Zero Brokerage',
        available: 'Immediate',
        images,
        videos,
        contactEmail,
        contactPhone
      };
 
      await api.createProperty(propertyData, token);
 
      setStep(0);
      setTitle('');
      setLocation('');
      setPrice('');
      setDeposit('');
      setBhk('2 BHK');
      setSqft('');
      setType('Full House');
      setFurnished('Semi-furnished');
      setParking(false);
      setGym(false);
      setLift(false);
      setPetFriendly(false);
      setSecurity(true);
      setContactEmail('');
      setContactPhone('');
      setImages([]);
      setVideos([]);
      navigation.navigate('Home', {
        selectCity: detectedCity,
        selectType: type
      });
    } catch (err) {
      console.error('Error posting property:', err);
      Alert.alert('Error', err.message || 'Failed to post property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Post Property</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="add-circle-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySub}>Log in to post a new property listing for free</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.browseBtnText}>Go to Profile / Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        {step > 0 && <TouchableOpacity onPress={() => setStep(step - 1)}><Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} /></TouchableOpacity>}
        <Text style={styles.headerTitle}>Post Property</Text>
        <Text style={styles.stepText}>{step + 1}/{STEPS.length}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      {/* Step labels */}
      <View style={styles.stepLabels}>
        {STEPS.map((s, i) => (
          <Text key={s} style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <FormLabel text="Property Title *" />
            <TextInput style={styles.input} placeholder="e.g. 2BHK in Koramangala" value={title} onChangeText={setTitle} placeholderTextColor={COLORS.gray} />
            <FormLabel text="Location / Area *" />
            <View style={styles.locationInputRow}>
              <View style={styles.locationInputWrapper}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} style={styles.locationInputIcon} />
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Enter location manually..."
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor={COLORS.gray}
                  outlineStyle="none"
                />
              </View>
              <TouchableOpacity 
                style={styles.mapPinButton} 
                onPress={() => { 
                  setTempLocation(location || mapCenter.label || 'India'); 
                  setMapModalVisible(true); 
                }}
              >
                <Ionicons name="map-outline" size={16} color={COLORS.white} />
                <Text style={styles.mapPinButtonText}>Select on Map</Text>
              </TouchableOpacity>
            </View>
            <FormLabel text="Property Type" />
            <View style={styles.optionRow}>
              {['Full House', 'PG/Hostel', 'Flatmates'].map(t => (
                <TouchableOpacity key={t} style={[styles.optionChip, type === t && styles.optionChipActive]} onPress={() => setType(t)}>
                  <Text style={[styles.optionText, type === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <>
            <FormLabel text="Monthly Rent (₹) *" />
            <TextInput style={styles.input} placeholder="e.g. 25000" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
            <FormLabel text="Security Deposit (₹)" />
            <TextInput style={styles.input} placeholder="e.g. 100000" value={deposit} onChangeText={setDeposit} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
            <FormLabel text="BHK Type" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
              {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK'].map(b => (
                <TouchableOpacity key={b} style={[styles.optionChip, bhk === b && styles.optionChipActive]} onPress={() => setBhk(b)}>
                  <Text style={[styles.optionText, bhk === b && styles.optionTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FormLabel text="Area (sqft)" />
            <TextInput style={styles.input} placeholder="e.g. 1200" value={sqft} onChangeText={setSqft} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
            <FormLabel text="Furnishing" />
            <View style={styles.optionRow}>
              {['Furnished', 'Semi-furnished', 'Unfurnished'].map(f => (
                <TouchableOpacity key={f} style={[styles.optionChip, furnished === f && styles.optionChipActive]} onPress={() => setFurnished(f)}>
                  <Text style={[styles.optionText, furnished === f && styles.optionTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <FormLabel text="Contact Email (Gmail)" />
            <TextInput style={styles.input} placeholder="e.g. contact@gmail.com (Optional)" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" placeholderTextColor={COLORS.gray} autoCapitalize="none" />
            <FormLabel text="Contact Phone Number" />
            <TextInput style={styles.input} placeholder="e.g. 9876543210 (Optional)" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" placeholderTextColor={COLORS.gray} />
          </>
        )}

        {/* Step 2: Amenities */}
        {step === 2 && (
          <>
            <ToggleRow label="Parking Available" value={parking} onChange={setParking} />
            <ToggleRow label="Gym" value={gym} onChange={setGym} />
            <ToggleRow label="Lift" value={lift} onChange={setLift} />
            <ToggleRow label="Pet Friendly" value={petFriendly} onChange={setPetFriendly} />
            <ToggleRow label="24/7 Security" value={security} onChange={setSecurity} />
            <TouchableOpacity style={styles.uploadBox} onPress={pickMedia}>
              <Ionicons name="camera-outline" size={32} color={COLORS.gray} />
              <Text style={styles.uploadText}>Add Photos & Videos</Text>
              <Text style={styles.uploadSub}>Up to 10 photos, 1 video (optional)</Text>
            </TouchableOpacity>

            {/* Media list preview */}
            {(images.length > 0 || videos.length > 0) && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreviewList}>
                {images.map((img, idx) => (
                  <View key={`img-${idx}`} style={styles.mediaPreviewWrapper}>
                    <Image source={{ uri: img }} style={styles.mediaPreviewImage} />
                    <TouchableOpacity style={styles.mediaDeleteBtn} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
                {videos.map((vid, idx) => (
                  <View key={`vid-${idx}`} style={styles.mediaPreviewWrapper}>
                    <View style={[styles.mediaPreviewImage, styles.videoPreviewPlaceholder]}>
                      <Ionicons name="videocam" size={32} color={COLORS.primary} />
                      <Text style={styles.videoPreviewText}>Video</Text>
                    </View>
                    <TouchableOpacity style={styles.mediaDeleteBtn} onPress={() => removeVideo(idx)}>
                      <Ionicons name="close-circle" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}



      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={next} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{step === 2 ? 'Post Property' : 'Next'}</Text>
              <Ionicons name={step === 2 ? 'checkmark' : 'arrow-forward'} size={18} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Map Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalContent}>
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>Select Property Location</Text>
              <TouchableOpacity onPress={() => setMapModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBarWrapper}>
                <Ionicons name="search-outline" size={20} color={COLORS.gray} style={styles.searchBarIcon} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search cities or areas in India..."
                  value={searchQuery}
                  onChangeText={handleSearchSuggestions}
                  placeholderTextColor={COLORS.gray}
                  outlineStyle="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearchSuggestions('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.gray} />
                  </TouchableOpacity>
                )}
              </View>

              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestions.map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.suggestionItem} onPress={() => selectSuggestion(item)}>
                      <Ionicons name="location" size={16} color={COLORS.primary} />
                      <Text style={styles.suggestionLabel} numberOfLines={1}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.mapViewContainer}>
              {Platform.OS === 'web' ? (
                <iframe
                  id="map-iframe"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                      <style>
                        body { margin: 0; padding: 0; }
                        #map { height: 100vh; width: 100vw; }
                      </style>
                    </head>
                    <body>
                      <div id="map"></div>
                      <script>
                        var map = L.map('map').setView([${mapCenter.lat}, ${mapCenter.lng}], 13);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                          attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(map);
                        
                        var marker = L.marker([${mapCenter.lat}, ${mapCenter.lng}], { draggable: true }).addTo(map);
                        if ("${mapCenter.label}") {
                          marker.bindPopup("${mapCenter.label}").openPopup();
                        }

                        function sendPosition(lat, lng) {
                          var message = JSON.stringify({ type: 'location_selected', lat: lat, lng: lng });
                          if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(message);
                          } else {
                            window.parent.postMessage(message, '*');
                          }
                        }

                        marker.on('dragend', function(e) {
                          var position = marker.getLatLng();
                          sendPosition(position.lat, position.lng);
                        });

                        map.on('click', function(e) {
                          marker.setLatLng(e.latlng);
                          sendPosition(e.latlng.lat, e.latlng.lng);
                        });

                        window.addEventListener('message', function(e) {
                          try {
                            var data = JSON.parse(e.data);
                            if (data.type === 'update_position') {
                              var loc = [data.lat, data.lng];
                              map.setView(loc, 15);
                              marker.setLatLng(loc);
                              if (data.label) {
                                marker.bindPopup(data.label).openPopup();
                              }
                            }
                          } catch(err) {}
                        });
                      </script>
                    </body>
                    </html>
                  `}
                  style="width: 100%; height: 100%; border: none;"
                />
              ) : (
                <View style={styles.nativeMapFallback}>
                  <Ionicons name="map-outline" size={48} color={COLORS.primary} />
                  <Text style={styles.fallbackTitle}>Interactive Map View</Text>
                  <Text style={styles.fallbackCoords}>
                    Coordinates: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                  </Text>
                  <Text style={styles.fallbackText}>Selected Address: {tempLocation || 'Fetching...'}</Text>
                </View>
              )}
            </View>

            <View style={styles.mapConfirmFooter}>
              <Text style={styles.confirmLocationText} numberOfLines={2}>
                {tempLocation || 'No location selected'}
              </Text>
              <TouchableOpacity 
                style={[styles.confirmBtn, !tempLocation && styles.confirmBtnDisabled]} 
                onPress={confirmLocation}
                disabled={!tempLocation}
              >
                <Text style={styles.confirmBtnText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Media Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={mediaModalVisible}
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <View style={styles.mediaModalOverlay}>
          <View style={styles.mediaModalContent}>
            <View style={styles.mediaModalHeader}>
              <Text style={styles.mediaModalTitle}>Select Media Type</Text>
              <TouchableOpacity onPress={() => setMediaModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.mediaModalBody}>
              <TouchableOpacity style={styles.mediaOptionBtn} onPress={pickImages}>
                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                <View style={styles.mediaOptionTextWrapper}>
                  <Text style={styles.mediaOptionTitle}>Upload Photos</Text>
                  <Text style={styles.mediaOptionSub}>Select up to 10 photos of your property</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOptionBtn} onPress={pickVideo}>
                <Ionicons name="videocam-outline" size={24} color={COLORS.primary} />
                <View style={styles.mediaOptionTextWrapper}>
                  <Text style={styles.mediaOptionTitle}>Upload Video</Text>
                  <Text style={styles.mediaOptionSub}>Select 1 video of your property</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.mediaCancelBtn} onPress={() => setMediaModalVisible(false)}>
              <Text style={styles.mediaCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FormLabel({ text }) {
  return <Text style={{ fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500' }}>{text}</Text>;
}

function ToggleRow({ label, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderColor: COLORS.border }}>
      <Text style={{ fontSize: SIZES.md, color: COLORS.textPrimary }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: COLORS.primary }} thumbColor={COLORS.white} />
    </View>
  );
}

function ReviewRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: COLORS.border }}>
      <Text style={{ fontSize: SIZES.sm, color: COLORS.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  stepText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  progressBar: { height: 4, backgroundColor: COLORS.grayMid },
  progressFill: { height: 4, backgroundColor: COLORS.primary },
  stepLabels: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  stepLabel: { flex: 1, fontSize: 10, color: COLORS.gray, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  form: { padding: 16, flexGrow: 1 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: 12, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: 16, outlineStyle: 'none' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  optionChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  optionText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  optionTextActive: { color: COLORS.primary, fontWeight: '600' },
  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.grayMid, borderRadius: SIZES.radius, padding: 32, alignItems: 'center', marginTop: 20, gap: 8 },
  uploadText: { fontSize: SIZES.md, color: COLORS.textSecondary, fontWeight: '500' },
  uploadSub: { fontSize: SIZES.sm, color: COLORS.gray },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: 16 },
  reviewTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  freeNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.successLight, padding: 12, borderRadius: SIZES.radius, marginTop: 16 },
  freeNoticeText: { flex: 1, fontSize: SIZES.sm, color: COLORS.success },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 0.5, borderColor: COLORS.border },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 14 },
  nextBtnText: { fontSize: SIZES.lg, color: COLORS.white, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '600', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  browseBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  browseBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  locationInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
  },
  locationInputIcon: {
    marginRight: 8,
  },
  locationTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
  },
  mapPinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  mapPinButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  mediaPreviewList: {
    marginTop: 16,
    flexDirection: 'row',
  },
  mediaPreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  mediaPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.grayMid,
  },
  videoPreviewPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  mediaDeleteBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mapModalContent: {
    width: '100%',
    maxWidth: 600,
    height: '80%',
    maxHeight: 700,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },
  mapModalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    position: 'relative',
    zIndex: 10,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchBarIcon: {
    marginRight: 2,
  },
  searchBarInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },
  suggestionLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mapViewContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  nativeMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  fallbackTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  fallbackCoords: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  fallbackText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
  },
  mapConfirmFooter: {
    padding: 16,
    borderTopWidth: 0.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    gap: 12,
  },
  confirmLocationText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.grayMid,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  mediaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mediaModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    padding: 20,
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  mediaModalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mediaModalBody: {
    gap: 12,
    marginBottom: 16,
  },
  mediaOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaOptionTextWrapper: {
    flex: 1,
  },
  mediaOptionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mediaOptionSub: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  mediaCancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.grayMid,
    marginTop: 8,
  },
  mediaCancelBtnText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
