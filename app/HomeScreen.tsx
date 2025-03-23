import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import Header from './components/Header';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useActivityDropDownListQuery, useStartNewTripMutation, useTrucksandtailorsQuery } from './redux/features/tripApis/TripApi';
import FormSection from './components/FormSection';

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('en-US', {
  weekday: 'short', // 'Mon'
  year: 'numeric', // '2025'
  month: 'short', // 'Jan'
  day: 'numeric', // '29'
});


const DateSection = () => (
  <View style={tw`flex-row justify-between p-3 font-bold text-lg bg-[#f1f0f6]`}>
    <Text style={tw`text-lg font-bold text-gray-700`}>Start Your Day</Text>
    <Text style={tw`text-lg font-bold text-gray-700`}>{formattedDate}</Text>
  </View>
);



const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [apikey, setApikey] = useState("");
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
  }, []);

  // Fetch dropdown lists
  const { data, isLoading, isError } = useActivityDropDownListQuery({ apikey });
  const { data: truckandTailordata, isLoading: truckLoading, isError: truckError } = useTrucksandtailorsQuery({ apikey });

  const [startNewTrip] = useStartNewTripMutation();

  // Handle form submission
  const handleSubmit = async () => {
    console.log("Form Data:", formData);

    // Check if all required fields are filled
    if (!formData.activity || !formData.location || !formData.currentTime || !formData.truck || !formData.trailer || !formData.odometer) {
      return Alert.alert("Error", "Please fill all the fields");
    }

    const tripData = { 
      status: 200,
      start: [
        {
          timestamp: formData.currentTime,
          location: formData.location,
          odometer: formData.odometer,
          truck: formData.truck,
          trailer: formData.trailer,
          // notes: "Trip started via mobile app.",
        },
      ],
    };

    try {
      setLoading(true);
      const response = await startNewTrip({ apikey, ...tripData }).unwrap();
      console.log("Trip Response:", response);
      // const data = response?.data;
      if(response?.data?.code === 'invalid'){
        Alert.alert("Login Error", "Invalid email or password.");
      }
      if(response?.data?.code === 'success'){
        AsyncStorage.setItem("startedTrip", JSON.stringify(response?.data));
        Alert.alert("Success", "Trip started successfully!");

        navigation.navigate("AddTrip");
      }
 
      // navigation.navigate("AddTrip", { ...formData });
    } catch (error) {
      console.error("Error starting trip:", error);
      Alert.alert("Error", "Failed to start trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Header />
      <DateSection />
      <FormSection formData={formData} setFormData={setFormData} activityList={data?.data?.activitylist || [] } trucklistandtailorlist={truckandTailordata?.data || []} />


      <View style={tw`flex flex-row items-center justify-end px-4`}>
        <TouchableOpacity
          style={tw`bg-[#29adf8] p-3 mb-4 rounded w-[40%]`}
          onPress={handleSubmit}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>Start Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Display loading spinner */}
      {loading && (
        <View style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-gray-500 opacity-50`}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <Text style={tw`text-center bg-[#f1f0f6] p-3 font-bold text-lg`}>Today's Trip Details</Text>
      {/* <Text style={tw`text-center bg-[#f1f0f6] p-3 font-bold text-lg`}>{apikey}</Text> */}



    </View>
  );
};

export default HomeScreen;
