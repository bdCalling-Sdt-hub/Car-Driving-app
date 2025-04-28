import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Keyboard,
  Pressable,
  ActivityIndicator
} from "react-native";
import tw from "twrnc";
import DatePicker from 'react-native-date-picker';
import axios from "axios";
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useIsFocused } from "@react-navigation/native";

// Interfaces remain the same
interface FormData {
  activity: string;
  location: string;
  truck: string;
  trailer: string;
  odometer: string;
  routeNumber: string;
  currentTime: string;
  lat: number;
  long: number;
}

interface FormSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  activityList: { item: string }[];
  trucklistandtailorlist: {
    trucklist: { item: string }[];
    trailerlist: { item: string }[];
  };
  setcurrentTime: React.Dispatch<React.SetStateAction<string>>;
  currentTime: string;
  latitude: number;
  longitude: number;
  setLatitude: React.Dispatch<React.SetStateAction<number>>;
  setLongitude: React.Dispatch<React.SetStateAction<number>>;
}

// Memoized CustomDropdown component
const CustomDropdown = React.memo(({
  options,
  selectedValue,
  onSelect,
  placeholder,
  style
}: {
  options: { item: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  style?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[tw`relative z-10`, style]}>
      <TouchableOpacity
        style={tw`flex-row items-center justify-between border border-gray-300 rounded px-3 h-[44px] bg-white`}
        onPress={() => setIsOpen(true)}
      >
        <Text style={tw`text-gray-700 ${!selectedValue && 'text-gray-400'}`}>
          {selectedValue || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={tw`flex-1 bg-black bg-opacity-30 justify-center items-center`}
          onPress={() => setIsOpen(false)}
        >
          <View style={tw`bg-white rounded-lg w-4/5 max-h-[60%] shadow-lg`}>
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item.item}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  style={tw`py-3 px-4`}
                  onPress={() => {
                    onSelect(item.item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={tw`text-gray-800 ${selectedValue === item.item ? 'font-bold text-blue-600' : ''}`}>
                    {item.item}
                  </Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={tw`border-t border-gray-200`} />}
              initialNumToRender={10}
              windowSize={5}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

const FormSection: React.FC<FormSectionProps> = ({
  formData,
  setFormData,
  activityList,
  setcurrentTime,
  currentTime, 
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  trucklistandtailorlist = { trucklist: [], trailerlist: [] },
}) => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showsuggestion, setShowsuggestion] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const isFocused = useIsFocused();

  // Memoized format function
  const formatTime24Hour = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  // Debounced location search
  const debouncedSearchLocation = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (!query) {
          setLocationSuggestions([]);
          return;
        }
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=AIzaSyAfW5xjLmNIkot1I438jq0C9cezbx6_uNQ`
          );
          setLocationSuggestions(response?.data?.results || []);
          setShowsuggestion(true);
        } catch (error) {
          console.log('Location search error:', error);
          setLocationSuggestions([]);
        }
      }, 300);
    };
  }, []);

  // Memoized location select handler
  const handleSelectLocation = useCallback((suggestion: any) => {
    setFormData(prev => ({ ...prev, location: suggestion.formatted_address }));
    setLocationSuggestions([]);
    setShowsuggestion(false);
    Keyboard.dismiss();
  }, [setFormData]);

  // Effect to clear time when currentTime is cleared
  useEffect(() => {
    if (!currentTime) {
      setTime(null);
    }
  }, [currentTime]);

  // Memoized safe lists
  const safeTruckList = useMemo(() => trucklistandtailorlist?.trucklist || [], [trucklistandtailorlist]);
  const safeTrailerList = useMemo(() => trucklistandtailorlist?.trailerlist || [], [trucklistandtailorlist]);
  const safeActivityList = useMemo(() => activityList || [], [activityList]);

  // Location handler with proper cleanup
  const handleGetLocationFormLS = useCallback(async () => {
    try {
      setLocationLoading(true);
      
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Foreground permission not granted');
        return;
      }
  
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background permission not granted');
        return;
      }
  
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      });
  
      setCurrentLocation(addressResponse[0]?.formattedAddress || '');
      setLatitude(newLocation.coords.latitude);
      setLongitude(newLocation.coords.longitude);
    } catch (error) {
      console.log('Error getting location:', error);
    } finally {
      setLocationLoading(false);
    }
  }, [setLatitude, setLongitude]);

  // Location effect with cleanup
  useEffect(() => {
    if (isFocused) {
      handleGetLocationFormLS();
    }
  }, [isFocused, handleGetLocationFormLS]);

  // Memoized input change handlers
  const handleRouteNumberChange = useCallback((text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, routeNumber: numericText }));
  }, [setFormData]);

  const handleOdometerChange = useCallback((text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, odometer: numericText }));
  }, [setFormData]);

  const handleLocationChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, location: text }));
    debouncedSearchLocation(text);
  }, [debouncedSearchLocation, setFormData]);

  // Memoized location suggestions list
  const memoizedLocationSuggestions = useMemo(() => (
    <View style={tw`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60`}>
      <FlatList
        data={locationSuggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <Pressable
            style={tw`py-3 px-4 border-b border-gray-100`}
            onPress={() => handleSelectLocation(item)}
          >
            <Text style={tw`text-gray-800`}>{item.formatted_address}</Text>
          </Pressable>
        )}
        initialNumToRender={5}
        windowSize={5}
      />
    </View>
  ), [locationSuggestions, handleSelectLocation]);

  return (
    <Pressable 
      style={tw`p-4`}
      onPress={() => {
        if (showsuggestion) {
          setShowsuggestion(false);
          Keyboard.dismiss();
        }
      }}
    >
      {/* Activity Dropdown */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Activity:</Text>
        <CustomDropdown
          options={safeActivityList}
          selectedValue={formData?.activity}
          onSelect={(value) => setFormData(prev => ({ ...prev, activity: value }))}
          placeholder={`${safeActivityList[0]?.item || 'Select Activity'}`}
          style={tw`w-[70%]`}
        />
      </View>

      {/* Location Input */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Location:</Text>
        <View style={tw`w-[70%] relative`}>
          {locationLoading ? (
            <View style={tw`border border-gray-300 rounded h-[44px] justify-center items-center`}>
              <ActivityIndicator size="small" color="#29adf8" />
            </View>
          ) : (
            <>
              <TextInput
                onChangeText={handleLocationChange}
                style={tw`text-base border border-gray-300 px-3 h-[44px] rounded w-full bg-white`}
                placeholder={currentLocation || "Enter location"}
                value={formData.location}
                onFocus={() => setShowsuggestion(true)}
              />
              
              {locationSuggestions.length > 0 && showsuggestion && memoizedLocationSuggestions}
            </>
          )}
        </View>
      </View>

      {/* Route Number */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Route #:</Text>
        <TextInput
          style={tw`text-base border border-gray-300 px-3 h-[44px] rounded w-[70%] bg-white`}
          placeholder="Enter Route Number"
          value={formData.routeNumber}
          onChangeText={handleRouteNumberChange}
          keyboardType="number-pad"
        />
      </View>

      {/* Current Time */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Current Time:</Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={tw`border border-gray-300 rounded w-[70%] h-[44px] justify-center px-3 bg-white`}
        >
          <Text style={tw`text-gray-700 ${!time && 'text-gray-400'}`}>
            {time ? formatTime24Hour(time) : 'Select Time'}
          </Text>
        </Pressable>

        <DatePicker
          modal
          mode="time"
          open={open}
          date={time || new Date()}
          onConfirm={(selectedTime) => {
            setOpen(false);
            const timeString = formatTime24Hour(selectedTime);
            setcurrentTime(timeString);
            setFormData(prev => ({ ...prev, currentTime: timeString }));
            setTime(selectedTime);
          }}
          onCancel={() => {
            setOpen(false);
          }}
          is24hourSource="locale"
          locale="en_GB"
        />
      </View>

      {/* Truck Dropdown */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Select Truck:</Text>
        <CustomDropdown
          options={safeTruckList}
          selectedValue={formData?.truck || ''}
          onSelect={(value) => setFormData(prev => ({ ...prev, truck: value }))}
          placeholder={safeTruckList[0]?.item || 'Select Truck'}
          style={tw`w-[70%]`}
        />
      </View>

      {/* Trailer Dropdown */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Select Trailer:</Text>
        <CustomDropdown
          options={safeTrailerList}
          selectedValue={formData?.trailer || ''}
          onSelect={(value) => setFormData(prev => ({ ...prev, trailer: value }))}
          placeholder={safeTrailerList[0]?.item || 'Select Trailer'}
          style={tw`w-[70%]`}
        />
      </View>

      {/* Odometer Input */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-gray-700 font-bold text-sm`}>Odometer:</Text>
        <TextInput
          style={tw`text-base border border-gray-300 px-3 h-[44px] rounded w-[70%] bg-white`}
          placeholder="Enter Odometer Reading"
          value={formData.odometer}
          onChangeText={handleOdometerChange}
          keyboardType="number-pad"
        />
      </View>
    </Pressable>
  );
};

export default React.memo(FormSection);