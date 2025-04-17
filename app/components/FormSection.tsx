import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Keyboard
} from "react-native";
import tw from "twrnc";
import DatePicker from 'react-native-date-picker';
import axios from "axios";
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useIsFocused } from "@react-navigation/native";

interface FormData {
  activity: string;
  location: string;
  truck: string;
  trailer: string;
  odometer: string;
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
  currentTime: string; // Add this prop
  latitude: number;
  longitude: number;
  setLatitude: React.Dispatch<React.SetStateAction<number>>;
  setLongitude: React.Dispatch<React.SetStateAction<number>>;
}

const CustomDropdown = ({
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
    <View style={[styles.dropdownContainer, style]}>
      <TouchableOpacity
        style={[styles.dropdownHeader, { height: 44 }]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.dropdownHeaderText}>
          {selectedValue || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item.item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedValue === item.item && styles.selectedItem
                  ]}>
                    {item.item}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

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
console.log('Current Location:', currentLocation);
  const formatTime24Hour = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSearchLocation = async (query: string) => {
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
      console.log(error)
      setLocationSuggestions([]);
    }
  };

  const handleSelectLocation = (suggestion: any) => {
    setFormData({ ...formData, location: suggestion.formatted_address });
    setLocationSuggestions([]);
    setShowsuggestion(false);
  };

  // Reset time when currentTime is cleared
  React.useEffect(() => {
    if (!currentTime) {
      setTime(null);
    }
  }, [currentTime]);

  const safeTruckList = trucklistandtailorlist?.trucklist || [];
  const safeTrailerList = trucklistandtailorlist?.trailerlist || [];
  const safeActivityList = activityList || [];
  const isFocused = useIsFocused();
  const handleScreenPress = () => {
    if (showsuggestion) {
      setShowsuggestion(false);
      Keyboard.dismiss();
    }
  };




  const handleGetLocationFormLS = async () => {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Foreground permission not granted');
        return;
      }
  
      // Now request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background permission not granted');
        return;
      }
  
      // If both permissions granted, get current position
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      });
  
      setCurrentLocation(addressResponse[0].formattedAddress || '');
      setLatitude(newLocation.coords.latitude);
      setLongitude(newLocation.coords.longitude);

      console.log('Current Location:', addressResponse);
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };
  
  React.useEffect(() => {
    handleGetLocationFormLS();
  }, [isFocused]);
  




  return (
    <TouchableOpacity onPress={handleScreenPress} style={tw`p-4`}>
      {/* Activity Dropdown */}
      <View style={tw`flex flex-row items-center justify-between gap-4 mb-3`}>
        <Text style={tw`text-gray-700 font-bold text-[14px]`}>Activity:</Text>
        <CustomDropdown
          options={activityList}
          selectedValue={formData?.activity}
          onSelect={(value) => setFormData({ ...formData, activity: value })}
          placeholder={`${activityList[0]?.item}`}
          style={tw`w-[70%]`}
        />
      </View>

      {/* Location Input */}
      <View style={tw`flex flex-row items-center justify-between gap-4 mb-3`}>
        <Text style={tw`text-gray-700 font-bold text-[14px]`}>Location:</Text>
        <View style={tw`w-[70%]`}>
          <TextInput
        
            onChangeText={(text) => {
              setFormData({ ...formData, location: text });
              handleSearchLocation(text);
            }}
            style={tw`text-[15px] border border-gray-300 px-2 h-[44px] rounded w-full`}
            placeholder="Enter Your Location"
            value={formData.location || currentLocation}
          />
          {locationSuggestions.length > 0 && showsuggestion && (
            <View style={tw`absolute top-[44px] left-0 right-0 bg-white border border-gray-300 rounded z-10 mt-1`}>
              {locationSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectLocation(suggestion)}
                  style={tw`p-2 border-b border-gray-300`}
                >
                  <Text>{suggestion.formatted_address}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Current Time */}
      <View style={tw`flex flex-row items-center justify-between gap-4 mb-3`}>
        <Text style={tw`text-gray-700 font-bold text-[14px]`}>Current Time:</Text>
        <View style={tw`flex-1 border border-gray-300 rounded max-w-[70%]`}>
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={tw`h-[44px] justify-center`}
          >
            <Text style={tw`text-gray-700 text-[15px] px-2`}>
              {time ? formatTime24Hour(time) : 'Select Time'}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            mode="time"
            open={open}
            date={time || new Date()}
            onConfirm={(selectedTime) => {
              setOpen(false);
              const timeString = formatTime24Hour(selectedTime);
              setcurrentTime(timeString);
              setFormData({ ...formData, currentTime: timeString });
              setTime(selectedTime);
            }}
            onCancel={() => {
              setOpen(false);
            }}
            is24hourSource="locale"
            locale="en_GB"
          />
        </View>
      </View>

      {/* Truck and Trailer Dropdowns */}
      <View style={tw`flex flex-row items-center justify-between gap-4 mb-3`}>
        <Text style={tw`text-gray-700 font-bold text-[14px]`}>Select Truck:</Text>
        <View style={tw`flex flex-row items-center justify-between gap-4 w-[70%]`}>
          <CustomDropdown
            options={safeTruckList}
            selectedValue={formData?.truck || ''}
            onSelect={(value) => setFormData({ ...formData, truck: value })}
            placeholder={safeTruckList[0]?.item || 'Select Truck'}
            style={tw`flex-1`}
          />
        </View>
      </View>

      <View style={tw` gap-4 mb-3  flex flex-row items-center justify-between`}>
        <Text style={tw`text-gray-700 font-bold text-[14px]`}>Select Trailer:</Text>
        <CustomDropdown
          options={safeTrailerList}
          selectedValue={formData?.trailer || ''}
          onSelect={(value) => setFormData({ ...formData, trailer: value })}
          placeholder={safeTrailerList[0]?.item || 'Select Trailer'}
          style={tw`flex-1 max-w-[70%]`}
        />
      </View>

      {/* Odometer Input */}
      <View style={tw`flex flex-row items-center justify-between gap-4`}>
        <Text style={tw`text-gray-700 font-bold text-[14px]`}>Odometer:</Text>
        <TextInput
          style={tw`text-[15px] border border-gray-300 px-2 h-[44px] rounded w-[70%]`}
          placeholder="Enter Odometer Reading"
          value={formData.odometer}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setFormData({ ...formData, odometer: numericText });
          }}
          keyboardType="number-pad"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  dropdownHeaderText: {
    fontSize: 15,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedItem: {
    color: '#2563eb',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 8,
  },
});

export default FormSection;