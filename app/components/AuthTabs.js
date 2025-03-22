import React, { useState } from "react";
import { View, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from "react-native";
import tw from "twrnc";
import SignUpPage from "../SignUpPage";
import SignInPage from "../SignInPage";


export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState("signup");

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Main content area */}
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Your form content can go here */}
        <View style={tw`px-6 pt-12`}>
          {/* Conditional rendering of the selected screen */}
          {activeTab === "signup" ? <SignUpPage /> : <SignInPage />}
        </View>
      </KeyboardAvoidingView>

      {/* Bottom buttons */}
      <View style={tw`absolute bottom-0 left-0 right-0 p-4`}>
        <View style={tw`flex-row items-center justify-between mb-6 border-2 border-gray-200 rounded-xl`}>
          <TouchableOpacity
            onPress={() => setActiveTab("signup")}
            style={tw`flex-1 p-3 ${activeTab === "signup" ? "bg-[#29adf8]" : "bg-white"} rounded-l-xl flex-row items-center justify-center`}
          >
            <Text style={tw`${activeTab === "signup" ? "text-white" : "text-gray-500"} font-bold`}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("signin")}
            style={tw`flex-1 p-3 ${activeTab === "signin" ? "bg-[#29adf8]" : "bg-white"} rounded-r-xl flex-row items-center justify-center`}
          >
            <Text style={tw`${activeTab === "signin" ? "text-white" : "text-gray-500"} font-bold`}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
