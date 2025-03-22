import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLoginUserMutation } from "../app/redux/features/users/UserApi"; // Correct import
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type for navigation
type RootStackParamList = {
  HomeScreen: undefined;
};

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const navigation = useNavigation<ReactNavigation.NativeStackNavigationProp<RootStackParamList>>();


  const [loginUser, { isLoading, isError, error, data }] = useLoginUserMutation();

  // Form validation function
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // If token exists, navigate to HomeScreen
        navigation.navigate('HomeScreen');
      }
    };

    checkToken();
  }, [navigation]);


 
  const handleSignIn = async () => {
    console.log("Sign In Button Pressed", email, password);
   
      const response = await loginUser({ email, password }).unwrap();
      console.log("Login Success:", response);

      if(response?.data?.code === 'invalid'){
        Alert.alert("Login Error", "Invalid email or password.");
      }
  
      // Check if response contains 'user' or any necessary data
      if (response?.data?.apikey) {
       AsyncStorage.setItem("token", response?.data?.apikey);
        alert("Sign In Success");
        navigation.navigate("HomeScreen");
      } 
    
  };
  return (
    <View style={tw`bg-white`}>
      <Text style={tw`text-2xl font-semibold`}>Sign In </Text>
      <Text style={tw`text-gray-500 text-sm font-medium mt-2 mb-6`}>
        Welcome back! Please enter your credentials.
      </Text>

      <TextInput
        style={tw`border border-gray-300 rounded-lg px-2 mb-4 text-[16px] font-bold text-gray-600`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-1 mb-6`}>
        <TextInput
          style={tw`flex-1 text-[16px] px-2 font-bold text-gray-600`}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity style={tw`px-2`} onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons name={passwordVisible ? "eye" : "eye-off"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignIn} style={tw`bg-[#29adf8] w-[70%] mx-auto py-3 shadow-lg rounded-lg items-center`}>
        <Text style={tw`text-white text-lg font-bold`}> {
          isLoading ? <View style={tw`flex flex-row items-center gap-2`}><Ionicons name="refresh" size={24} color="white" /> <Text style={tw`text-[16px] text-white font-bold`}>Loading</Text></View> : "Sign In"
        } </Text>
       
    
      </TouchableOpacity>
    </View>
  );
};

export default SignInPage;
