import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Text, View, TouchableOpacity, Image } from "react-native";
import tw from "@/assets/lib/tailwind";
import Header from "./components/Header";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./redux/store";

const CustomSidebar = () => {
   const navigation = useNavigation();
  return (
    <View style={tw`h-full flex-1 bg-[#29adf8] p-5`}>
      {/* Add your custom header or any additional components */}
      <View style={tw`flex-row justify-between items-center bg-[#29adf8]  p-2`}>
            <Image source={require('../assets/images/companylogo_srl.png')} />

            <View style={tw`flex-row items-center gap-3`}>
                <Text style={tw`text-xl font-bold text-white`}>BANINDER PAL</Text>
                {/* <TouchableOpacity  onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={tw` border border-white rounded-full h-[40px] w-[40px] flex flex-row items-center justify-center`}>
                    <Text style={tw`text-white text-2xl`}>☰</Text>
                </TouchableOpacity>  */}
                <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center`} onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}>
                     <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>


  


      <TouchableOpacity
        onPress={() => navigation.navigate('HomeScreen')}
        style={tw`p-4`}>
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>BANINDER PAL</Text>
      </TouchableOpacity>

      {/* Add your menu options */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTrip')}
        style={tw`p-4`}>
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>Add Trip</Text>
      </TouchableOpacity>

      {/* Additional menu items */}
      <TouchableOpacity onPress={() => navigation.navigate('CreateNewPassword')} style={tw`p-4`}>
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>CHANGE PASSWORD</Text>
      </TouchableOpacity>
      <TouchableOpacity style={tw`p-4`}>
        <Text style={tw`text-white text-xl font-semibold border-b-2 pb-2 border-white`}>HELP & SUPPORT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={tw`p-4`}>
        <Text style={tw`text-white text-2xl font-semibold`}>SIGN OUT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>

    <GestureHandlerRootView style={{ flex: 1 }}>
      
      <Drawer
        drawerContent={(props) => <CustomSidebar {...props} />}
        screenOptions={{
          drawerStyle: {
            width: '100%', // This should ensure full width on the drawer content
          },
        }}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: "Home", title: "Home", headerShown: false }} />
        <Drawer.Screen name="AddTrip" options={{ headerShown: false }} />
        <Drawer.Screen name="CreateNewPassword" options={{ headerShown: false, title: "Change Password" }} />
      </Drawer>
    </GestureHandlerRootView>
    </Provider>
  );
}
