import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import Header from "./components/Header";

// Create New Password screen component
const CreateNewPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);

  // Function to validate the form
  const validateForm = (): boolean => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Validation Error", "Both fields are required.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return false;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSavePassword = () => {
    if (validateForm()) {
      // Handle password saving logic here (e.g., API call)
      Alert.alert("Success", "Password has been successfully changed.");
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

        {/* Confirm Password Input */}
        <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-1 mb-6`}>
          <TextInput
            style={tw`flex-1 text-[16px] px-2 font-bold text-gray-600`}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity style={tw`px-2`} onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Ionicons name={confirmPasswordVisible ? "eye" : "eye-off"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Save Password Button */}
        <TouchableOpacity
          onPress={handleSavePassword}
          style={tw`bg-[#29adf8] w-[70%] mx-auto py-3 shadow-lg rounded-lg items-center`}
        >
          <Text style={tw`text-white text-lg font-bold`}>Save Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateNewPassword;
