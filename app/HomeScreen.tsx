import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import Header from './components/Header';
import FormSection from './components/FormSection';
import { 
  useActivityDropDownListQuery, 
  useStartNewTripMutation, 
  useTrucksandtailorsQuery 
} from './redux/features/tripApis/TripApi';
import { Stack } from 'expo-router';

type RootStackParamList = {
  SignInPage: undefined;
  AddTrip: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [apikey, setApikey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Memoized form data state
  const [formData, setFormData] = useState({
    activity: "",
    location: "",
    lat: 0,
    long: 0,
    currentTime: "",
    truck: "",
    trailer: "",
    odometer: "",
    routeNumber: "",
  });

  // Memoized current date calculation
  const currentDate = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
  }, []);

  // Memoized custom date format
  const customDate = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Fetch stored API key with cleanup
  useEffect(() => {
    let isMounted = true;
    
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!isMounted) return;
        
        if (!token) {
          navigation.navigate("SignInPage");
        } else {
          setApikey(token);
        }
      } catch (error) {
        console.error("Token check error:", error);
        if (isMounted) {
          navigation.navigate("SignInPage");
        }
      }
    };

    checkToken();
    
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  // Optimized dropdown data fetching
  const { 
    data: activityData, 
    isLoading: isActivityLoading 
  } = useActivityDropDownListQuery(
    { apikey }, 
    { skip: !apikey }
  );

  const { 
    data: truckandTailordata, 
    isLoading: isTruckLoading 
  } = useTrucksandtailorsQuery(
    { apikey }, 
    { skip: !apikey }
  );

  const [startNewTrip] = useStartNewTripMutation();

  // Memoized activity list
  const activityList = useMemo(() => 
    activityData?.data?.primarylist || [], 
    [activityData]
  );

  // Memoized truck and trailer list
  const trucklistandtailorlist = useMemo(() => 
    truckandTailordata?.data || [], 
    [truckandTailordata]
  );

  // Form submission handler with cleanup
  const handleSubmit = useCallback(async () => {
    if (loading) return;

    // Validate required fields
    const requiredFields = [
      'activity', 'location', 'currentTime', 
      'truck', 'trailer', 'odometer', 'routeNumber'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      return Alert.alert("Error", "Please fill all the required fields");
    }

    const tripData = {
      status: 200,
      start: [{
        timestamp: `${customDate} ${currentTime}`,
        location: formData.location,
        lat: latitude,
        long: longitude,
        odometer: formData.odometer,
        routeNumber: formData.routeNumber,
        truck: formData.truck,
        trailer: formData.trailer,
      }],
    };

    try {
      setLoading(true);
      const response = await startNewTrip({ apikey, ...tripData }).unwrap();

      if (response?.data?.code === 'success') {
        await AsyncStorage.setItem("startedTrip", JSON.stringify(response.data));
        
        navigation.navigate("AddTrip");
        // Reset form state
        setFormData(prev => ({
          ...prev,
          activity: "",
          location: "",
          currentTime: "",
          truck: "",
          trailer: "",
          odometer: "",
          routeNumber: "",
        }));
        setCurrentTime("");
        
        Alert.alert("Success", "Trip started successfully!");
        
      } else {
        Alert.alert("Error", response?.data?.message || "Failed to start trip");
      }
    } catch (error) {
      console.error("Trip start error:", error);
      Alert.alert("Error", "Failed to start trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    formData, 
    currentTime, 
    latitude, 
    longitude, 
    customDate, 
    apikey, 
    loading, 
    navigation
  ]);

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
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        activityList={activityList}
        trucklistandtailorlist={trucklistandtailorlist}
      />

      <View style={tw`flex flex-row items-center justify-end px-4`}>
        <TouchableOpacity
          style={tw.style(
            `p-3 mb-4 rounded w-[100%]`,
            loading ? 'bg-gray-400' : 'bg-[#29adf8]'
          )}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>
            {loading ? 'Starting...' : 'Start Trip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* {loading && (
        <View style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-gray-500 opacity-50`}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )} */}
    </View>
  );
};

export default React.memo(HomeScreen);