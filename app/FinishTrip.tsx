import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import Header from './components/Header';
import FormSection from './components/FormSection';
import { useActivityDropDownListQuery, useStartNewTripMutation, useTrucksandtailorsQuery } from './redux/features/tripApis/TripApi';
import { Stack } from 'expo-router';

// Define the navigation types
type RootStackParamList = {
  SignInPage: undefined;
  AddTrip: undefined;
};

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('en-US', {
  weekday: 'short', // 'Mon'
  year: 'numeric', // '2025'
  month: 'short', // 'Jan'
  day: 'numeric', // '29'
});

const DateSection = () => (
  <View style={tw`flex-row justify-between p-3 bg-[#f1f0f6]`}>
    <Text style={tw`text-lg font-bold text-gray-700`}>Start Your Day</Text>
    <Text style={tw`text-lg font-bold text-gray-700`}>{formattedDate}</Text>
  </View>
);

const FinishTrip = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [apikey, setApikey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity: "",
    location: "",
    currentTime: "",
    truck: "",
    trailer: "",
    odometer: "",
  });

  // Fetch stored API key
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("SignInPage");
      } else {
        setApikey(token);
      }


    };
    checkToken();
  }, [navigation]);





  // Fetch dropdown lists only when apikey is available
  const { data, isLoading, isError } = useActivityDropDownListQuery(apikey ? { apikey } : {}, { skip: !apikey });
  const { data: truckandTailordata, isLoading: truckLoading, isError: truckError } = useTrucksandtailorsQuery(apikey ? { apikey } : {}, { skip: !apikey });

  const [startNewTrip] = useStartNewTripMutation();

  const [tripNumber, setTripNumber] = useState(null);
  useEffect(() => {
    const fetchTripNumber = async () => {
      try {
        const storedTrip = await AsyncStorage.getItem('startedTrip');
        if (storedTrip) {
          const parsedTrip = JSON.parse(storedTrip);
          setTripNumber(parsedTrip.TripNumber);
        }
      } catch (error) {
        console.error('Error retrieving trip number:', error);
      }
    };
    fetchTripNumber();
  }, []);
  // Handle form submission
  const handleSubmit = async () => {
    console.log("finish Form Data:", formData);

    // Check if all required fields are filled
    if (!formData.activity || !formData.location || !formData.currentTime || !formData.truck || !formData.trailer || !formData.odometer) {
      return Alert.alert("Error", "Please fill all the fields");
    }

    const tripData = {
      status: 200,
      TripNumber: tripNumber,
      finish: [
        {
          timestamp: formData.currentTime,
          location: formData.location,
          odometer: formData.odometer,
          truck: formData.truck,
          trailer: formData.trailer,
        },
      ],
    };

    try {
      setLoading(true);
      const response = await startNewTrip({ apikey, ...tripData }).unwrap();
      console.log("Trip Response:", response);

      if (response?.data?.code === 'invalid') {
        Alert.alert("Login Error", "Invalid email or password.");
      } else if (response?.data?.code === 'success') {
        await AsyncStorage.setItem("startedTrip", JSON.stringify(response?.data));
        Alert.alert("Success", "Trip finished successfully!");
        navigation.navigate("AddTrip");
      } else {
        Alert.alert("Error", "Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error finish trip:", error);
      Alert.alert("Error", "Failed to start trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <DateSection />
      <FormSection
        formData={formData}
        setFormData={setFormData}
        activityList={data?.data?.activitylist || []}
        trucklistandtailorlist={truckandTailordata?.data || []}
      />

      <View style={tw`flex flex-row items-center justify-end px-4`}>
        <TouchableOpacity
          style={tw`bg-red-500 p-3 mb-4 rounded w-full`}
          onPress={handleSubmit}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>Finish Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Display loading spinner */}
      {loading && (
        <View style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-gray-500 opacity-50`}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

    
    
    </View>
  );
};

export default FinishTrip;
