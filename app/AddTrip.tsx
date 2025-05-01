import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Pressable
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Header from './components/Header';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from './components/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActivityDropDownListQuery, useAddTripAcvityMutation, useOneTripAcvityMutation, useTypeDropDownListQuery } from './redux/features/tripApis/TripApi';
import { format } from "date-fns";
import DatePicker from 'react-native-date-picker';
import axios from 'axios';
import { Stack } from 'expo-router';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Memoized Location Suggestion Item
const LocationSuggestionItem = React.memo(({ item, onSelect }) => (
  <Pressable
    style={tw`py-3 px-4 border-b border-gray-100`}
    onPress={() => onSelect(item)}
  >
    <Text style={tw`text-gray-800`}>{item.formatted_address}</Text>
  </Pressable>
));

type AddTripProps = NativeStackScreenProps<RootStackParamList, "AddTrip">;

const AddTrip: React.FC<AddTripProps> = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [OneTripAcvity] = useOneTripAcvityMutation();
  const [AddTripAcvity] = useAddTripAcvityMutation();
  
  const formatTime24Hour = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const route = useRoute();
  const Navigation = useNavigation();
  const isFocused = useIsFocused();

  // Form state
  const [activity, setActivity] = useState<string>('');
  const [consignee, setConsignee] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [startedTrip, setStartedTrip] = useState(null);
  const [TrackingNumber, setTrackingNumber] = useState<string>('');
  const [tripdetails, setTripdetails] = useState(null);
  const [apikey, setApikey] = useState<string>('');
  const [tripAcvitys, setTripAcvitys] = useState([]);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showsuggestion, setShowsuggestion] = useState(false);

  // Modal states
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [showTypeModal, setShowTypeModal] = useState<boolean>(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch dropdown lists
  const { data, isLoading: loading } = useActivityDropDownListQuery({ apikey });
  const { data: typeData } = useTypeDropDownListQuery({ apikey });
  const acvityData = data?.data?.activitylist || [];
  const typeDataList = typeData?.data?.loadtypes || [];

  // Debounced location search
  const debouncedSearchLocation = useCallback(
    debounce(async (query) => {
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
        console.log(error);
        setLocationSuggestions([]);
      }
    }, 300),
    []
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        const [trips, finishtrip, token] = await Promise.all([
          AsyncStorage.getItem('startedTrip'),
          AsyncStorage.getItem('finishtrip'),
          AsyncStorage.getItem('token')
        ]);
        
        if (trips) setStartedTrip(JSON.parse(trips));
        if (finishtrip) setTripdetails(JSON.parse(finishtrip));
        if (token) setApikey(token);
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load trip data');
        Navigation.navigate('HomeScreen');
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [Navigation, isFocused]);

  // Fetch trip activities
  useEffect(() => {
    const fetchTripActivities = async () => {
      if (!apikey || !startedTrip?.TripNumber) return;

      try {
        setDataLoading(true);
        const body = { status: 200, TripNumber: startedTrip.TripNumber };
        const response = await OneTripAcvity({ apikey, body }).unwrap();
        setTripAcvitys(response.data || []);
      } catch (err) {
        console.error("Trip activities loading error:", err);
        setError("Failed to load trip activities");
      } finally {
        setDataLoading(false);
      }
    };

    if (isFocused && !initialLoading) {
      fetchTripActivities();
    }
  }, [isFocused, apikey, startedTrip?.TripNumber, initialLoading]);

  const matched = tripdetails?.TripNumber === startedTrip?.TripNumber;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const customDate = `${year}-${month}-${day}`;

  const handleAddTrip = async () => {
    const tripData = {
      status: 200,
      TripNumber: startedTrip?.TripNumber,
      activities: [
        {
          activity,
          location: consignee,
          timestamp: customDate + " " + deliveryTime,
          quantity,
          type,
          partyname: receiverName,
          notes: note,
          trackingNumber: TrackingNumber
        },
      ],
    };

    try {
      const response = await AddTripAcvity({ apikey, body: tripData }).unwrap();
      setTripAcvitys(response?.data);
      if (response?.data?.code === 'success') {
        setActivity('');
        setConsignee('');
        setDeliveryTime('');
        setQuantity('');
        setType('');
        setReceiverName('');
        setNote('');
        setTime(null);
        Alert.alert("Trip Activity Added", "Trip Activity Added Successfully");
      }
    } catch (error) {
      console.error("Error adding trip:", error);
      Alert.alert("Error", "Failed to add trip activity");
    }
  };

  const handleSelectLocation = (suggestion: any) => {
    setConsignee(suggestion.formatted_address);
    setLocationSuggestions([]);
    setShowsuggestion(false);
    Keyboard.dismiss();
  };

  const finishTrip = () => {
    Navigation.navigate('FinishTrip');
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#29adf8" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-white`}>
        <Text style={tw`text-red-500 text-lg mb-4`}>{error}</Text>
        <TouchableOpacity
          style={tw`bg-blue-500 px-4 py-2 rounded`}
          onPress={() => Navigation.goBack()}
        >
          <Text style={tw`text-white`}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <Pressable 
      style={tw`flex-1 bg-white`}
      onPress={() => {
        if (showsuggestion) {
          setShowsuggestion(false);
          Keyboard.dismiss();
        }
      }}
    >
      <Stack.Screen  options={
        { 
          headerShown: false,
          animation: 'fade',
        }

        
        } />
      {/* <StatusBar barStyle="light-content" /> */}
      <Header />

      {dataLoading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#29adf8" />
        </View>
      ) : (
        <ScrollView style={tw`flex-1`}>
          <View style={tw`flex-row justify-between items-center p-4 bg-gray-100 border-b border-gray-300`}>
            <Text style={tw`text-xl font-bold text-gray-800`}>Add Trip Activity</Text>
            <Text style={tw`text-lg font-bold text-gray-700 text-center`}>{currentDate}</Text>
          </View>

          {/* Form Section */}
          <View style={tw`p-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <Text style={tw`w-24 text-base font-medium`}>Activity:</Text>
              <TouchableOpacity
                style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5 flex-row items-center justify-between`}
                onPress={() => setShowActivityModal(true)}
              >
                <Text>{activity || acvityData[0]?.item}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View style={tw`flex-row items-center mb-4 w-[100%] relative`}>
              <Text style={tw`w-24 text-base font-medium`}>Location</Text>
              <View style={tw`flex-1`}>
                <TextInput
                  style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5`}
                  value={consignee}
                  onChangeText={(text) => {
                    setConsignee(text);
                    debouncedSearchLocation(text);
                  }}
                  placeholder="Location"
                />

                {locationSuggestions.length > 0 && showsuggestion && (
                  <View style={tw`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60`}>
                    <FlatList
                      data={locationSuggestions}
                      keyExtractor={(item) => item.place_id}
                      renderItem={({ item }) => (
                        <LocationSuggestionItem 
                          item={item} 
                          onSelect={handleSelectLocation} 
                        />
                      )}
                      keyboardShouldPersistTaps="handled"
                    />
                  </View>
                )}
              </View>
            </View>

            <View style={tw`flex-row items-center mb-4 w-[100%] relative mt-2`}>
              <Text style={tw`text-gray-700 font-bold text-[14px]`}>Tracking #:</Text>
              <TextInput
                style={tw`text-[15px] border border-gray-300 px-2 h-[44px] rounded w-[75%] absolute right-0`}
                placeholder="Dispatch Tracking Number"
                value={TrackingNumber}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setTrackingNumber(numericText);
                }}
                keyboardType="number-pad"
              />
            </View>

            <View style={tw`flex-row items-center mb-4 mt-2`}>
              <Text style={tw`w-24 text-base font-medium`}>
                {activity === 'Pickup' ? 'Pickup' : 'Delivery:'}
              </Text>
              <View style={tw`flex-1 flex flex-row items-center gap-2`}>
                <View style={tw`flex-1 border border-gray-300 rounded max-w-[70%]`}>
                  <TouchableOpacity 
                    onPress={() => setOpen(true)} 
                    style={tw`h-[42px] justify-center`}
                  >
                    <Text style={tw`text-gray-700 text-[15px] px-2 pl-3`}>
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
                      setDeliveryTime(formatTime24Hour(selectedTime));
                      setTime(selectedTime);
                    }}
                    onCancel={() => {
                      setOpen(false);
                    }}
                    is24hourSource="locale"
                    locale="en_GB"
                  />
                </View>

                <TouchableOpacity style={tw`flex-1 max-w-[18%] h-[42px] border border-gray-300 rounded items-center justify-center mr-1`}>
                  <TextInput
                    style={tw`text-center w-full h-full`}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="QTY"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`flex-1 max-w-[35%] h-[42px] border border-gray-300 rounded px-2.5 mr-1 flex-row items-center justify-between`}
                  onPress={() => setShowTypeModal(true)}
                >
                  <Text>{type || typeDataList[0]?.item}</Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={tw`flex flex-row items-center gap-2 justify-end`}>
              <View style={tw`flex-1 max-w-[10%] pb-4`}>
                <TouchableOpacity
                  style={tw`w-[33px] h-8 rounded-full bg-green-500 items-center justify-center`}
                  onPress={() => setShowAddNoteModal(true)}
                >
                  <AntDesign name="plus" size={24} color="#ffff" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={tw`h-11 w-full max-w-[75%] border border-gray-300 rounded px-2.5 mb-4 text-center`}
                placeholder="Party Name"
                value={receiverName}
                onChangeText={setReceiverName}
                placeholderTextColor="#000"
              />
            </View>
          </View>

          <TouchableOpacity
            disabled={matched}
            style={tw`mx-2 mb-4 flex-1 max-w-[100%] ${matched ? 'bg-gray-400' : 'bg-[#29adf8]'} py-2 rounded-sm`}
            onPress={handleAddTrip}
          >
            <Text style={tw`text-white text-lg text-center font-bold`}>Add Trip Activity</Text>
          </TouchableOpacity>

          {/* Trip Details Section */}
          <View style={tw`bg-white`}>
            <TouchableOpacity
              disabled={matched}
              style={tw`mb-4 flex-1 max-w-[100%] bg-gray-100 border-b border-gray-300 py-2 rounded-sm`}
            >
              <Text style={tw`text-lg pl-4 text-gray-700 font-bold`}>Today's Trip Details</Text>
            </TouchableOpacity>
            
            <View style={tw`px-4`}>
              <View style={tw`h-[100%] absolute right-2 border border-dashed border-gray-400 w-[2px] mr-2`} />
              <View style={tw`flex-row items-center absolute -right-1 pr-2 -top-0`}>
                <FontAwesome
                  name="circle"
                  style={tw`border border-gray-300 py-1 px-[5px] rounded-full text-green-500`}
                  size={18}
                />
              </View>
              <Text style={tw`text-base font-semibold`}>Started</Text>
              <Text style={tw`text-xs text-gray-500`}>Start Time: {startedTrip?.start?.timestamp}</Text>
              <Text style={tw`text-xs text-gray-500`}>End Time: {startedTrip?.start?.maxactivitytimelimit}</Text>
              <Text style={tw`text-sm text-gray-600`}>Location: {startedTrip?.start?.location}</Text>
            </View>

            {tripAcvitys?.activities?.map((item, index) => (
              <View key={index} style={tw`px-4`}>
                <View style={tw`h-[100%] absolute right-2 border border-dashed border-gray-400 mr-2`} />
                <View style={tw`flex-row items-center absolute -right-1 pr-2 top-3`}>
                  <FontAwesome
                    name="circle"
                    style={tw`border border-gray-300 py-1 px-[5px] rounded-full 
                      ${item.activity?.includes("Waiting") ? "text-orange-500" : "text-[#29adf8]"}`}
                    size={18}
                  />
                </View>
                <Text style={tw`text-base font-semibold mt-4`}>{item.activity}</Text>
                {item.timestampfrom && item.timestampto ? (
                  <Text style={tw`text-sm text-gray-600`}>
                    {new Date(item?.timestampfrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - 
                    {new Date(item?.timestampto).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                ) : <Text style={tw`text-xs text-gray-500`}>{item.timestamp}</Text>}
                <Text style={tw`text-sm text-gray-600`}>Location: {item.location}</Text>
                {item.qty && <Text style={tw`text-sm text-gray-600`}>Quantity: {item.qty} {item.Type}</Text>}
                {item.notes && (
                  <Text style={tw`text-sm text-gray-500 italic`}>Notes: {item.notes}</Text>
                )}
              </View>
            ))}

            {matched && (
              <View style={tw`px-4`}>
                <View style={tw`h-[100%] absolute right-2 mr-2`} />
                <View style={tw`flex-row items-center absolute -right-1 pr-2 top-0`}>
                  <FontAwesome
                    name="circle"
                    style={tw`border border-gray-300 py-1 px-[5px] rounded-full`}
                    size={18}
                    color={"red"}
                  />
                </View>
                <Text style={tw`text-base font-semibold text-[#ff0000] mt-2`}>Finished</Text>
                <Text style={tw`text-xs text-gray-500`}>finish time: {tripdetails?.finish?.timestamp}</Text>
                <Text style={tw`text-sm text-gray-600`}>Location: {tripdetails?.finish?.location}</Text>
              </View>
            )}

            <TouchableOpacity
              disabled={matched}
              style={tw`mx-2 mb-4 mt-20 py-2 rounded-sm ${matched ? "bg-gray-400" : "bg-red-500"}`}
              onPress={finishTrip}
            >
              <Text style={tw`text-white text-lg text-center font-bold`}>Finish Trip</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Activity Selection Modal */}
      <Modal
        visible={showActivityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            {acvityData?.map((data) => (
              <TouchableOpacity
                key={data.item}
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => {
                  setActivity(data.item);
                  setShowActivityModal(false);
                }}
              >
                <Text style={tw`text-center ${activity === data.item ? 'font-bold text-blue-500' : ''}`}>
                  {data.item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={tw`mt-4 bg-gray-200 py-2 rounded-lg`}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={tw`text-center`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Type</Text>
            {typeDataList.map((option) => (
              <TouchableOpacity
                key={option.item}
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => {
                  setType(option.item);
                  setShowTypeModal(false);
                }}
              >
                <Text style={tw`text-center ${type === option.item ? 'font-bold text-blue-500' : ''}`}>
                  {option?.item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={tw`mt-4 bg-gray-200 py-2 rounded-lg`}
              onPress={() => setShowTypeModal(false)}
            >
              <Text style={tw`text-center`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        visible={showAddNoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddNoteModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Add Note</Text>
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium mb-2`}>Short Note:</Text>
              <TextInput
                style={tw`border border-gray-300 rounded p-2 h-20`}
                value={note}
                onChangeText={setNote}
                placeholder="Enter a short note about this location..."
                multiline
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              style={tw`bg-gray-200 py-2 rounded-lg`}
              onPress={() => setShowAddNoteModal(false)}
            >
              <Text style={tw`text-center`}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
};

export default AddTrip;