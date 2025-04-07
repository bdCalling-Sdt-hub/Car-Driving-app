import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import tw from 'twrnc';
import { useNavigation } from 'expo-router';
import { DrawerActions, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderLogoQuery } from '../redux/features/tripApis/TripApi';


const Header = () => {
    const navigation = useNavigation();

    const isFocused = useIsFocused();

    const [user, setUser] = React.useState(null);
    const [token, setToken] = React.useState(null);
    const { data, isLoading, isError } = useHeaderLogoQuery({ apikey: token });

console.log("datass",data?.data?.companylogo);

    useEffect(() => {
        const gettoken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);

        };

        gettoken();
    }, [ token ]);



    useEffect(() => {
        const checkuser = async () => {
            const user = await AsyncStorage.getItem('user');
            const parseduser = JSON.parse(user);
            setUser(parseduser);

        };

        checkuser();
    }, [ isFocused ]);

    return (
        <View style={tw`flex-row justify-between items-center bg-[#29adf8]  p-2`}>
            <Image source={{ uri: data?.data?.companylogo }} style={tw`aspect-video h-10 `} />
            {/* <Text>{data?.data?.companylogo}</Text> */}

            <View style={tw`flex-row items-center gap-3`}>
                <Text style={tw`text-xl font-bold text-white`}>{user?.DriverName || 'Driver'}</Text>
                {/* <TouchableOpacity  onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={tw` border border-white rounded-full h-[40px] w-[40px] flex flex-row items-center justify-center`}>
                    <Text style={tw`text-white text-2xl`}>☰</Text>
                </TouchableOpacity>  */}
                <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center`} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Header;
