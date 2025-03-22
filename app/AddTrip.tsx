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
  Modal
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import tw from 'twrnc'; // Import twrnc

import { useNavigation, useRoute } from '@react-navigation/native';
import Header from './components/Header';

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
  id: string;
  activity: string;
  consignee: string;
  deliveryTime: string;
  quantity: string;
  type: string;
  receiverName: string;
  date: string;
  locations: TripLocation[];
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

// Activity options
const activityOptions = [
  'Dropoff/ Delivery',
  'Pickup',
  'Delivery',
  'Return',
  'Other'
];

// Type options
const typeOptions = [
  'Package',
  'Document',
  'Pallet',
  'Container',
  'Other'
];

const AddTrip: React.FC = () => {
  // Form state
  const [activity, setActivity] = useState<string>('Dropoff/ Delivery');
  const [consignee, setConsignee] = useState<string>('Dropoff Location (Google)');
  const [deliveryTime, setDeliveryTime] = useState<string>('8:00 AM');
  const [quantity, setQuantity] = useState<string>('1');
  const [type, setType] = useState<string>('Package');
  const [receiverName, setReceiverName] = useState<string>('');
  const [note, setNote] = useState<string>('');


  const Navigation = useNavigation();
  const route = useRoute();
  const { response } = route.params; 

  console.log("Received Trip response:", response);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Modal states
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [showTypeModal, setShowTypeModal] = useState<boolean>(false);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);

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

  // Initialize a default trip on component mount
  useEffect(() => {
    createNewTrip();
  }, []);

  // Create a new trip with default values
  const createNewTrip = () => {
    const newTrip: Trip = {
      id: Date.now().toString(),
      activity: activity,
      consignee: consignee,
      deliveryTime: deliveryTime,
      quantity: quantity,
      type: type,
      receiverName: receiverName,
      date: currentDate,
      locations: [
        {
          id: '1',
          type: 'Start',
          leaveTime: formatDateTime(new Date()),
          location: 'Current Location',
          status: 'start'
        }
      ]
    };

    setCurrentTrip(newTrip);
    setTrips([...trips, newTrip]);
  };

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
  const addLocation = (locationType: string) => {
    if (!currentTrip) return;

    const now = new Date();
    const newLocation: TripLocation = {
      id: Date.now().toString(),
      type: locationType,
      leaveTime: formatDateTime(now),
      location: consignee,
      note: note,
      status: locationType.toLowerCase()
    };

    const updatedLocations = [...currentTrip.locations, newLocation];

    // Add a waiting status if needed
    if (locationType === 'Pickup 1') {
      const waitingTime = new Date(now.getTime() + 25 * 60000); // 25 minutes later
      const waitingLocation: TripLocation = {
        id: Date.now().toString() + '-waiting',
        type: '',
        leaveTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${waitingTime.getHours().toString().padStart(2, '0')}:${waitingTime.getMinutes().toString().padStart(2, '0')}`,
        location: '',
        status: 'waiting',
        waiting: true
      };
      updatedLocations.push(waitingLocation);
    }
    const updatedTrip = {
      ...currentTrip,
      locations: updatedLocations
    };

    setCurrentTrip(updatedTrip);

    // Update the trips array
    const updatedTrips = trips.map(trip =>
      trip.id === currentTrip.id ? updatedTrip : trip
    );
    setTrips(updatedTrips);
    // Clear note after adding
    setNote('');
  };

  // Add a finish location to the current trip
  const finishTrip = () => {
    if (!currentTrip) return;

    const now = new Date();
    const finishLocation: TripLocation = {
      id: Date.now().toString(),
      type: 'Finish',
      leaveTime: formatDateTime(now),
      location: 'End Location',
      status: 'finish'
    };

    const updatedLocations = [...currentTrip.locations, finishLocation];
    const updatedTrip = {
      ...currentTrip,
      locations: updatedLocations,
      receiverName: receiverName
    };

    setCurrentTrip(updatedTrip);

    // Update the trips array
    const updatedTrips = trips.map(trip =>
      trip.id === currentTrip.id ? updatedTrip : trip
    );

    setTrips(updatedTrips);
    Navigation.navigate('FinishTrip')
  };

  // Handle form submission
  const handleAddTrip = () => {
    if (!consignee) {
      Alert.alert('Error', 'Please enter a consignee location');
      return;
    }

    if (!currentTrip) {
      createNewTrip();
      return;
    }

    // Determine the next location type based on current trip
    const locationCount = currentTrip.locations.filter(loc => loc.type.includes('Pickup') || loc.type.includes('Drop')).length;

    if (activity.includes('Pickup')) {
      addLocation(`Pickup ${locationCount + 1}`);
    } else if (activity.includes('Delivery') || activity.includes('Dropoff')) {
      addLocation(`Drop ${locationCount + 1}`);
    } else {
      addLocation(activity);
    }

    // Clear consignee for next entry
    setConsignee('');
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
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="light-content" />
      <Header />

      <ScrollView style={tw`flex-1`}>
        <View style={tw`flex-row justify-between items-center p-4 bg-gray-100 border-b border-gray-300`}>
          <Text style={tw`text-2xl font-bold text-gray-800`}>Add Trip Info</Text>
          <Text style={tw`text-base text-gray-800`}>{currentDate}</Text>
        </View>

        {/* Form Section */}
        <View style={tw`p-4`}>
          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`w-24 text-base font-medium`}>Activity:</Text>
            <TouchableOpacity
              style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5 flex-row items-center justify-between`}
              onPress={() => setShowActivityModal(true)}
            >
              <Text>{activity}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`w-24 text-base font-medium`}>Consignee:</Text>
            <TextInput
              style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5`}
              value={consignee}
              onChangeText={setConsignee}
              placeholder="Enter location"
            />
          </View>

          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`w-24 text-base font-medium`}>Delivery:</Text>
            <View style={tw`flex-1 flex-row items-center`}>
              <TouchableOpacity
                style={tw`w-[90px] h-11 border border-gray-300 rounded px-2.5 mr-1 flex-row items-center justify-between`}
                onPress={() => setShowTimeModal(true)}
              >
                <Text>{deliveryTime}</Text>
                <Ionicons name="time-outline" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity style={tw`w-8 h-11 border border-gray-300 rounded items-center justify-center mr-1`}>
                <TextInput
                  style={tw`text-center w-full h-full`}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="QTY"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`w-[85px] h-11 border border-gray-300 rounded px-2.5 mr-1 flex-row items-center justify-between`}
                onPress={() => setShowTypeModal(true)}
              >
                <Text>{type}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`w-8 h-8 rounded-full bg-green-500 items-center justify-center`}
                onPress={() => setShowAddNoteModal(true)}
              >
                <AntDesign name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={tw`h-11 border border-gray-300 rounded px-2.5 mb-4 text-center`}
            placeholder="Receiver Name"
            value={receiverName}
            onChangeText={setReceiverName}
            placeholderTextColor="#000"
          />

        </View>

        {/* Add Trip Button */}
        <TouchableOpacity
          style={tw`mx-2 mb-4 bg-[#29adf8] py-2 rounded-sm`}
          onPress={handleAddTrip}
        >
          <Text style={tw`text-white text-lg text-center font-bold`}>Add Trip</Text>
        </TouchableOpacity>

        {/* Trip Details Section */}
        {currentTrip && (
          <View>
            <Text style={tw`text-center bg-[#f1f0f6] p-3 font-bold text-lg `}>Today's Trip Details</Text>

            <View style={tw`bg-[#ffffff]  p-4 pb-8`}>
              {currentTrip.locations.map((location, index) => {
                if (location.waiting) {
                  return (
                    <TripDetailItem
                      key={location.id}
                      type=""
                      time={location.leaveTime}
                      location=""
                      waiting={true}
                    />
                  );
                }

                return (
                  <React.Fragment key={location.id}>
                    <TripDetailItem
                      type={location.type}
                      time={location.leaveTime}
                      location={location.location}
                      note={location.note}
                      status={location.status}
                    />

                    {/* Add vertical line after each location except the last one */}
                    {index < currentTrip.locations.length - 1 && location.type !== 'Finish' && !currentTrip.locations[index + 1].waiting && (
                      <View style={tw`flex-row mb-2.5`}>
                        <View style={tw`flex-1 pr-2.5`}>
                          {location.type !== 'Start' && (
                            <Text style={tw`text-sm text-gray-600 mb-0.5`}>
                              Leave: {location.leaveTime}
                            </Text>
                          )}
                        </View>
                        <View style={tw`w-8 items-center`}>
                          <View style={tw`w-0.5 h-10 bg-gray-300`} />
                        </View>
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
            </View>

            {/* Finish Trip Button */}
            {currentTrip.locations.length > 1 && !currentTrip.locations.some(loc => loc.type === 'Finish') && (
              <TouchableOpacity
                style={tw`mx-4 my-4 bg-red-500 py-3 rounded-lg`}
                onPress={finishTrip}
              >
                <Text style={tw`text-white text-center font-bold`}>Finish Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Activity Selection Modal */}
      <Modal
        visible={showActivityModal}
        transparent={true}
        animationType="slide"
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Select Activity</Text>
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => {
                  setActivity(option);
                  setShowActivityModal(false);
                }}
              >
                <Text style={tw`text-center ${activity === option ? 'font-bold text-blue-500' : ''}`}>{option}</Text>
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
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Select Type</Text>
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => {
                  setType(option);
                  setShowTypeModal(false);
                }}
              >
                <Text style={tw`text-center ${type === option ? 'font-bold text-blue-500' : ''}`}>{option}</Text>
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
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg w-80 p-4`}>
            <Text style={tw`text-lg font-bold mb-4 text-center`}>Select Time</Text>

            {/* Scrollable Time List */}
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

            {/* Cancel Button */}
            <TouchableOpacity
              style={tw`mt-4 bg-gray-200 py-2 rounded-lg`}
              onPress={() => setShowTimeModal(false)}
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