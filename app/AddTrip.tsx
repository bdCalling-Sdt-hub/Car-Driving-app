import React, { useState, useEffect } from 'react';
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
  FlatList
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc'; // Import twrnc

import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Header from './components/Header';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from './components/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActivityDropDownListQuery, useAddTripAcvityMutation, useOneTripAcvityMutation, useTypeDropDownListQuery } from './redux/features/tripApis/TripApi';
import { format } from "date-fns";
import DatePicker from 'react-native-date-picker';
import axios from 'axios';
// Define TypeScript interfaces
interface TripDetailItemProps {
  type: string;
  time: string;
  location: string;
  note?: string;
  status?: string;
  waiting?: boolean;
}

interface TripLocation {
  id: string;
  type: string;
  arriveTime?: string;
  leaveTime: string;
  location: string;
  note?: string;
  status: string;
  waiting?: boolean;
}

interface Trip {
  id: any;
  activity: string;
  consignee: string;
  timestamp: string;
  quantity: string;
  type: string;
  partyname: string;
  notes: string;
  location: string;
  locations?: string;
}

// Trip detail item component
const TripDetailItem: React.FC<TripDetailItemProps> = ({ type, time, location, note, status, waiting }) => {
  let statusColor = '#000';
  if (type === 'Start') statusColor = '#1E90FF';
  if (type === 'Finish') statusColor = '#32CD32';
  if (waiting) statusColor = '#FF4500';

  return (
    <View style={tw`flex-row mb-2.5`}>
      <View style={tw`flex-1 pr-2.5`}>
        {waiting ? (
          <Text style={tw`text-base font-medium mb-0.5`}>Waiting for Pickup: {time}</Text>
        ) : (
          <Text style={tw`text-base font-medium mb-0.5`}>{type}:</Text>
        )}
        {!waiting && (
          <>
            <Text style={tw`text-sm text-gray-600 mb-0.5`}>
              {type === 'Start' || type === 'Pickup 1' || type === 'Drop 1' ? 'Leave: ' : 'Arrive: '}
              {time}
            </Text>
            <Text style={tw`text-sm text-gray-600`}>{location}</Text>
            {note && <Text style={tw`text-sm text-gray-500 italic mt-1`}>Note: {note}</Text>}
          </>
        )}
      </View>
      <View style={tw`w-8 items-center`}>
        <View style={[tw`w-5 h-5 rounded-full border-2 border-white`, { backgroundColor: statusColor }]} />
        <View style={tw`w-0.5 h-10 bg-gray-300`} />
      </View>
    </View>
  );
};



type AddTripProps = NativeStackScreenProps<RootStackParamList, "AddTrip">;
const AddTrip: React.FC<AddTripProps> = () => {
  const formatTime24Hour = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const route = useRoute();
  // Form state
  const [activity, setActivity] = useState<string>('');
  const [consignee, setConsignee] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [startedTrip, setStartedTrip] = useState(null);
  const [AddTripAcvity] = useAddTripAcvityMutation();
  const [OneTripAcvity] = useOneTripAcvityMutation();
  const [tripdetails, setTripdetails] = useState(null);
  const [apikey, setApikey] = useState<string>('');
  const Navigation = useNavigation();


  const [tripAcvitys, setTripAcvitys] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const getTrips = async () => {
      try {
        const trips = await AsyncStorage.getItem('startedTrip');
        console.log("Raw AsyncStorage Data:", trips)
        if (trips) {
          const parsedTrips = JSON.parse(trips);
          console.log("Parsed Trips:", parsedTrips);
          setStartedTrip(parsedTrips);
        }
      } catch (error) {
        console.error('Error retrieving trips:', error);
        Navigation.navigate('HomeScreen');
      }
    };

    getTrips();
  }, [Navigation, isFocused]);


  useEffect(() => {
    const getfinsihtrip = async () => {
      try {
        const trips = await AsyncStorage.getItem('finishtrip');
        console.log("Raw AsyncStorage Data:", trips)
        if (trips) {
          const parsedTrips = JSON.parse(trips);
          console.log("Parsed Trips:", parsedTrips);
          setTripdetails(parsedTrips);
        }
      } catch (error) {
        console.error('Error retrieving trips:', error);
        // Navigation.navigate('');
      }
    };

    getfinsihtrip();
  }, [Navigation, isFocused]);


  

  const [trips, setTrips] = useState<Trip[]>([]);


  // Modal states
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [showTypeModal, setShowTypeModal] = useState<boolean>(false);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState(false);
  // Get current date in the format "Wed Jan 29 2025"
  const getCurrentDate = (): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const now = new Date();
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();

    return `${day} ${month} ${date} ${year}`;
  };

  const currentDate = getCurrentDate();

  // Get current time in the format "8:00 AM"

  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(null);



  // Format date and time
  const formatDateTime = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate();
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}, ${dateNum < 10 ? '0' : ''}${dateNum} ${month} ${year} ${hours}:${minutes}`;
  };

  // Add a new location to the current trip


  // Add a finish location to the current trip
  const finishTrip = () => {
    Navigation.navigate('FinishTrip');
  };
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      setApikey(token);
    };
    checkToken();
  }, []);

  // Fetch dropdown lists
  const { data, isLoading, isError } = useActivityDropDownListQuery({ apikey });
  const { data: typeData, isLoading: typeLoading, isError: typeError } = useTypeDropDownListQuery({ apikey });
  const acvityData = data?.data.activitylist || [];
  const typeDataList = typeData?.data.loadtypes || [];
  // console.log('typeDataList', typeDataList);

  const matched = tripdetails?.TripNumber === startedTrip?.TripNumber;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  
  const customDate = `${year}-${month}-${day}`;

  console.log('matched', matched);
  console.log('matched', tripdetails?.TripNumber === startedTrip?.TripNumber);
  // Handle form submission
  const handleAddTrip = async () => {


    const tripData = {
      status: 200,
      TripNumber: startedTrip?.TripNumber,
      activities: [
        {
          activity,
          location: consignee,
          timestamp: customDate + " " +  deliveryTime,
          quantity,
          type,
          partyname: receiverName,
          notes: note,
        },
      ],
    };

    console.log('tripData', tripData);

    try {
      const response = await AddTripAcvity({ apikey, body: tripData }).unwrap();
      console.log("API Response:", response);
      setTripAcvitys(response?.data);
      if (response?.data?.code === 'success') {
        
        Alert.alert("Trip Activity Added", "Trip Activity Added Successfully");
      }
    } catch (error) {
      console.error("Error adding trip:", error);
    }

  };


  // Handle adding a note
  const handleAddNote = () => {
    setShowAddNoteModal(false);
  };
  const generateTimeOptions = () => {
    const times = [];
    const hours = 12;
    for (let i = 0; i < 24; i++) {
      const hour = i % hours === 0 ? 12 : i % hours;
      const period = i < 12 ? 'AM' : 'PM';
      times.push(`${hour}:00 ${period}`);
      times.push(`${hour}:30 ${period}`);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();


  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showsuggestion, setShowsuggestion] = useState(false);

  const handleSearchLocation = async (query: string) => {
    if (!query) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=AIzaSyARXa6r8AXKRaoeWqyesQNBI8Y3EUEWSnY`
      );
      setLocationSuggestions(response?.data?.results || []);
      setShowsuggestion(true);
    } catch (error) {
      console.log(error);
      setLocationSuggestions([]);
    }
  };

  const handleSelectLocation = (suggestion: any) => {
    setConsignee(suggestion.formatted_address);
    setLocationSuggestions([]);
    setShowsuggestion(false);
  };

  console.log('acvity++++++++++++', acvityData[0]?.item);
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="light-content" />
      <Header />

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
              <Text>{activity || acvityData[0]?.item }</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`w-24 text-base font-medium`}>{activity === 'Pickup' ? 'Shipper' : 'Consignee:'}</Text>
            <TextInput
              style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5`}
              value={consignee}
              onChangeText={(text) => {
                setConsignee(text);
                handleSearchLocation(text);
              }}
              placeholder={`${activity === 'Pickup' ? 'Shipper Location' : 'Dropoff Location'}`}
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

          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`w-24 text-base font-medium`}>{activity === 'Pickup' ? 'Pickup' : 'Delivery:'}</Text>
            <View style={tw`flex-1 flex flex-row items-center gap-2`}>
              <View style={tw`flex-1 border border-gray-300 rounded  max-w-[70%]`}>
                <TouchableOpacity onPress={() => setOpen(true)} style={tw`h-[42px] justify-center`}>
                  <Text style={tw`text-gray-700 text-[15px]  px-2 pl-3`}>
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
              is24hourSource="locale" // Force 24-hour format
              locale="en_GB" // British English locale for 24-hour format
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
                <AntDesign name="plus" size={24} color="white" />
              </TouchableOpacity>

            </View>
            <TextInput
              style={tw`h-11 w-full max-w-[75%]  border border-gray-300 rounded px-2.5 mb-4 text-center`}
              placeholder="Receiver Name"
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
          <Text style={tw`text-white text-lg text-center font-bold`}>Add Trip Acvity</Text>
        </TouchableOpacity>




        {/* Add Trip Button */}


        {/* Trip Details Section */}
        <View style={tw` bg-white`}>
          {/* <Text style={tw` bg-[#f1f0f6] p-2 mb-4 text-center  font-bold text-lg`}>Today's Trip Details</Text> */}

          <TouchableOpacity
            disabled={matched}
            style={tw` mb-4 flex-1 max-w-[100%] bg-gray-100 border-b border-gray-300 py-2 rounded-sm`}

          >
            <Text style={tw` text-lg pl-4 text-gray-700 font-bold `}>Today's Trip Details</Text>
          </TouchableOpacity>
          <View style={tw`px-4`}>
            <View style={tw`h-[100%] absolute right-2 border border-dashed border-gray-400 w-[2px] mr-2`} />
            <View style={tw`flex-row items-center absolute -right-1 pr-2 -top-0`}>
              <FontAwesome
                name="circle"
                style={tw`border border-gray-300 py-1 px-[5px] rounded-full text-green-500`}
                size={18}
                // color={"green"}
              />
            </View>
            <Text style={tw`text-base font-semibold`}>Start</Text>
            <Text style={tw`text-xs text-gray-500`}>Start Time: {startedTrip?.start?.timestamp}</Text>
            <Text style={tw`text-xs text-gray-500`}>End Time: {startedTrip?.start?.maxactivitytimelimit}</Text>
            <Text style={tw`text-sm text-gray-600`}>Location: {startedTrip?.start?.location}</Text>

          </View>

          {/* <FlatList
            data={tripAcvitys?.activities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {



              return (
                <View style={tw`p-4`}>
                  <View style={tw`h-[100%] absolute right-2 bg-gray-300 w-[2px] mr-2`} />

                  <View style={tw`flex-row items-center absolute -right-1 pr-2 -top-2`}>
                    <FontAwesome
                      name="circle"
                      style={tw`border border-gray-300 py-1 px-[5px] rounded-full`}
                      size={18}
                      color={item.activity === "Pickup" ? "blue" : "green"}
                    />
                  </View>

    
                  <Text style={tw`text-base font-semibold`}>{item.activity}</Text>

        
                  <Text style={tw`text-xs text-gray-500`}>{formattedTime}</Text>

      
                  <Text style={tw`text-sm text-gray-600`}>Location: {item.location}</Text>
                  <Text style={tw`text-sm text-gray-600`}>Quantity: {item.qty} {item.Type}</Text>

                  {item.notes && (
                    <Text style={tw`text-sm text-gray-500 italic`}>Notes: {item.notes}</Text>
                  )}
                </View>
              );
            }}
          /> */}


          {
            tripAcvitys?.activities?.map((item, index) => {
              const formattedTime = item.timestamp
                ? format(new Date(item.timestamp), "dd MMM yyyy, hh:mm a")
                : "N/A";
              return (

                <View key={index} style={tw`px-4`}>
                  <View style={tw`h-[100%] absolute right-2  border border-dashed border-gray-400  mr-2`} />

                  <View style={tw`flex-row items-center absolute -right-1 pr-2 top-3`}>
                    <FontAwesome
                      name="circle"
                      style={tw`border border-gray-300 py-1 px-[5px] rounded-full ${item.activity === "Pickup" ? "text-[#29adf8]" : "text-yellow-500"}`}
                      size={18}
                      // color={item.activity === "Pickup" ? "blue" : "green"}
                    />
                  </View>

                  {/* Activity Name */}
                  <Text style={tw`text-base font-semibold mt-4`}>{item.activity}</Text>

                  {/* Formatted Timestamp */}
                  <Text style={tw`text-xs text-gray-500`}>{formattedTime}</Text>

                  {/* Other Details */}
                  <Text style={tw`text-sm text-gray-600`}>Location: {item.location}</Text>
                  <Text style={tw`text-sm text-gray-600`}>Quantity: {item.qty} {item.Type}</Text>

                  {item.notes && (
                    <Text style={tw`text-sm text-gray-500 italic`}>Notes: {item.notes}</Text>
                  )}
                </View>
              )
            }
            )
          }

          {
            matched && (
              <View style={tw`px-4`}>
                <View style={tw`h-[100%] absolute right-2  mr-2`} />

                <View style={tw`flex-row items-center absolute -right-1 pr-2  top-0`}>
                  <FontAwesome
                    name="circle"
                    style={tw`border border-gray-300 py-1 px-[5px] rounded-full`}
                    size={18}
                    color={"red"}
                  />
                </View>

                {/* Activity Name */}
                <Text style={tw`text-base font-semibold text-[#ff0000] mt-2`}>Finish</Text>

                {/* Formatted Timestamp */}
                <Text style={tw`text-xs text-gray-500`}>finish time: {tripdetails?.finish?.timestamp}</Text>

                {/* Other Details */}
                <Text style={tw`text-sm text-gray-600`}>Location: {tripdetails?.finish?.location}</Text>
              </View>
            )
          }

          <TouchableOpacity
            disabled={matched} // Convert to boolean
            style={tw`mx-2 mb-4 mt-20 py-2 rounded-sm ${matched ? "bg-gray-400" : "bg-red-500"
              }`}
            onPress={finishTrip}
          >
            <Text style={tw`text-white text-lg text-center font-bold`}>Finish Trip</Text>
          </TouchableOpacity>


        </View>



      </ScrollView>

      {/* Activity Selection Modal */}
      <Modal
        visible={showActivityModal}
        transparent={true}
        animationType="slide"
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            {/* <Text style={tw`text-lg font-bold mb-4 text-center`}>Select Activity</Text> */}
            {acvityData?.map((data) => (
              <TouchableOpacity
                key={data.item} // Using data.item as the key
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => {
                  setActivity(data.item); // Ensure you're setting the correct value
                  setShowActivityModal(false);
                }}
              >
                <Text style={tw`text-center ${activity === data.item ? 'font-bold text-blue-500' : ''}`}>{data.item}</Text>
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
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}> Type</Text>
            {typeDataList.map((option) => (
              <TouchableOpacity
                key={option.item}
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => {
                  setType(option.item);
                  setShowTypeModal(false);
                }}
              >
                <Text style={tw`text-center ${type === option.item ? 'font-bold text-blue-500' : ''}`}>{option?.item}</Text>
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

      {/* Time Selection Modal */}
      {/* <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Select Time</Text>


            <View style={tw`h-60`}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {timeOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={tw`py-3 border-b border-gray-200`}
                    onPress={() => {
                      setDeliveryTime(option);
                      setShowTimeModal(false);
                    }}
                  >
                    <Text style={tw`text-center ${deliveryTime === option ? 'font-bold text-blue-500' : ''}`}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={tw`mt-4 bg-gray-200 py-2 rounded-lg`}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={tw`text-center`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

      </Modal> */}

      {/* Add Note Modal */}
      <Modal
        visible={showAddNoteModal}
        transparent={true}
        animationType="slide"
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
              onPress={handleAddNote}
            >
              <Text style={tw`text-center`}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddTrip;