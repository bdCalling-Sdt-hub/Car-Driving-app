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

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [apikey, setApikey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    activity: "",
    location: "",
    currentTime: "",
    truck: "",
    trailer: "",
    odometer: "",
  });

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

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const customDate = `${year}-${month}-${day}`;
  const currentDate = getCurrentDate();
  
  // Fetch stored API key
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      setApikey(token);
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

  // Handle form submission
  const handleSubmit = async () => {
    // Combine the form data with the currentTime state
    const completeFormData = {
      ...formData,
      currentTime: currentTime // Ensure currentTime is included
    };

    console.log("Form Data:", completeFormData);

    // Check if all required fields are filled
    if (!completeFormData.activity || !completeFormData.location || !completeFormData.currentTime || 
        !completeFormData.truck || !completeFormData.trailer || !completeFormData.odometer) {
      return Alert.alert("Error", "Please fill all the fields");
    }

    const tripData = {
      status: 200,
      start: [
        {
          timestamp: customDate + " " + completeFormData.currentTime,
          location: completeFormData.location,
          odometer: completeFormData.odometer,
          truck: completeFormData.truck,
          trailer: completeFormData.trailer,
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
        // Reset all form fields including currentTime
        setFormData({
          activity: "",
          location: "",
          currentTime: "",
          truck: "",
          trailer: "",
          odometer: "",
        });
        setCurrentTime(""); // Clear the currentTime state
        
        Alert.alert("Success", "Trip started successfully!");
        navigation.navigate("AddTrip");
      } else {
        Alert.alert("Error", "Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error starting trip:", error);
      Alert.alert("Error", "Failed to start trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <View style={tw`flex-row justify-between p-3 bg-[#f1f0f6]`}>
        <Text style={tw`text-lg font-bold text-gray-700`}>Start Your Day</Text>
        <Text style={tw`text-lg font-bold text-gray-700 text-center`}>
          {currentDate}
        </Text>
      </View>

      <FormSection
        formData={formData}
        setFormData={setFormData}
        setcurrentTime={setCurrentTime}
        currentTime={currentTime}
        activityList={data?.data?.primarylist || []}
        trucklistandtailorlist={truckandTailordata?.data || []}
      />

      <View style={tw`flex flex-row items-center justify-end px-4`}>
        <TouchableOpacity
          style={tw`bg-[#29adf8] p-3 mb-4 rounded w-[100%]`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>
            {loading ? 'Starting...' : 'Start Trip'}
          </Text>
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

export default HomeScreen;