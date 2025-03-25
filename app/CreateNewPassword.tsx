import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import Header from "./components/Header";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUpatePasswordMutation } from "./redux/features/users/UserApi";
import { useNavigation } from "expo-router";

// Create New Password screen component
const CreateNewPassword: React.FC = () => {
  const [code, setCode] = useState<string>(""); // Code input state
  const [newPassword, setNewPassword] = useState<string>(""); // New password input state
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // For toggling password visibility

  const [updatePassword, { isLoading, error }] = useUpatePasswordMutation(); // Use the updatePassword mutation hook


const navigation = useNavigation();

  const [apikey, setApikey] = useState("");

  useEffect(() => {
    const checkToken = async () => {  
      const token = await AsyncStorage.getItem("token");
      setApikey(token);
    };
    checkToken();
  }, []);



  // Function to handle password saving and API call
  const handleSavePassword = async () => {
    if (!code || !newPassword) {
      Alert.alert("Validation Error", "Both fields are required.");
      return;
    }
  
  
  
    const data = {
      code: code,
      password: newPassword,
    };
  
    try {
      // Trigger the updatePassword mutation API call
      const response = await updatePassword({ apikey, ...data }).unwrap();
      console.log("Update Password Response:", response);
  
      // Extract response data properly
      const { code, error } = response?.data || {};
  
      if (code === "Failure") {
        Alert.alert("Error", error || "Invalid code.");
      } else if (code === "Success") {
        Alert.alert("Success", error || "Password Updated Successfully");
        navigation.navigate("HomeScreen");
      }
    } catch (err) {
      console.error("Update Password Error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  

  return (
    <View>
      <Header />
      <View style={tw`bg-white p-4 h-full`}>
        <Text style={tw`text-2xl font-semibold mb-4`}>Create New Password</Text>
        <Text style={tw`text-gray-500 text-sm font-medium mt-2 mb-6`}>
          Please create a new password for your account.
        </Text>

        {/* Code Input */}
        <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-1 mb-4`}>
          <TextInput
            style={tw`flex-1 text-[16px] px-2 font-bold text-gray-600`}
            placeholder="Enter Code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
        </View>

        {/* New Password Input */}
        <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-1 mb-4`}>
          <TextInput
            style={tw`flex-1 text-[16px] px-2 font-bold text-gray-600`}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity style={tw`px-2`} onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons name={passwordVisible ? "eye" : "eye-off"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Save Password Button */}
        <TouchableOpacity
          onPress={handleSavePassword}
          style={tw`bg-[#29adf8] w-[70%] mx-auto py-3 shadow-lg rounded-lg items-center`}
        >
          <Text style={tw`text-white text-lg font-bold`}>
            {isLoading ? "Saving..." : "Save Password"}
          </Text>
        </TouchableOpacity>

        {/* Error Handling */}
        {error && (
          <Text style={tw`text-red-500 mt-4 text-center`}>{error.message}</Text>
        )}
      </View>
    </View>
  );
};

export default CreateNewPassword;
