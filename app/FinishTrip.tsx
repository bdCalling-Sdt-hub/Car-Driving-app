import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import Header from './components/Header';
import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';

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

const FormSection = ({ formData, setFormData }) => (
  <View style={tw`p-4`}>
    <View style={tw`flex flex-row items-start justify-between gap-4`}>
      <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Activity:</Text>
      <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 w-[73%]`}>
        <Picker
          selectedValue={formData.activity}
          onValueChange={(value) => setFormData({ ...formData, activity: value })}
        >
          <Picker.Item label="Dhaka" value="dhaka" />
          <Picker.Item label="London" value="london" />
          <Picker.Item label="UK" value="uk" />
          <Picker.Item label="India" value="india" />
        </Picker>
      </View>
    </View>

    <View style={tw`flex flex-row items-start justify-between gap-4`}>
      <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Location:</Text>
      <TextInput
        style={tw`font-bold text-lg border border-gray-300 p-3 rounded mb-3 w-[73%]`}
        placeholder="Enter Your Location (Google)"
        value={formData.location}
        onChangeText={(text) => setFormData({ ...formData, location: text })}
      />
    </View>

    <View style={tw`flex flex-row items-start justify-between gap-4`}>
      <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Current Time:</Text>
      <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}>
        <Picker
          selectedValue={formData.currentTime}
          onValueChange={(value) => setFormData({ ...formData, currentTime: value })}
        >
          <Picker.Item label="By default Current Timestamp" value="" />
        </Picker>
      </View>
    </View>

    <View style={tw`flex flex-row items-start justify-between gap-4`}>
      <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Choose:</Text>
      <View style={tw`flex flex-row items-start justify-between gap-4 w-[73%]`}>
        <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}>
          <Picker
            selectedValue={formData.tractor}
            onValueChange={(value) => setFormData({ ...formData, tractor: value })}
          >
            <Picker.Item label="Tractor" value="tractor" />
          </Picker>
        </View>
        <View style={tw`font-bold text-lg border border-gray-300 rounded mb-3 flex-1`}>
          <Picker
            selectedValue={formData.trailer}
            onValueChange={(value) => setFormData({ ...formData, trailer: value })}
          >
            <Picker.Item label="Trailer" value="trailer" />
          </Picker>
        </View>
      </View>
    </View>

    <View style={tw`flex flex-row items-start justify-between gap-4`}>
      <Text style={tw`text-gray-700 font-bold text-[14px] mb-1`}>Odometer:</Text>
      <TextInput
        style={tw`font-bold text-lg border border-gray-300 p-3 rounded w-[73%]`}
        placeholder="Enter Odometer Reading"
        value={formData.odometer}
        onChangeText={(text) => setFormData({ ...formData, odometer: text })}
      />
    </View>
  </View>
);

const FinishTrip = () => {
  const [formData, setFormData] = useState({
    activity: '',
    location: '',
    currentTime: '',
    tractor: '',
    trailer: '',
    odometer: '',
  });

  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();

  const handleSubmit = () => {
    console.log(formData); // Log all form data

    if (!formData) {
      return Alert.alert('Please fill all the fields');
    }

    setLoading(true); // Start loading state

    // Simulate a network request
    setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds
      navigation.navigate('AddTrip', { ...formData }); // Pass data to AddTrip page
    }, 2000);
  };

  return (
    <View style={tw`flex-1 bg-white`}>
        <Stack.Screen name="Home"  options={{ headerShown: false }} />
      <Header />
      <DateSection />
      <FormSection formData={formData} setFormData={setFormData} />

      <View style={tw`flex flex-row items-center justify-end px-4`}>
        <TouchableOpacity
          style={tw`bg-red-500 w-full p-3 mb-4 rounded `}
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
