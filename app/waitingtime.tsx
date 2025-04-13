import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    Modal,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Header from './components/Header';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from './components/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActivityDropDownListQuery, useAddTripAcvityMutation, useOneTripAcvityMutation } from './redux/features/tripApis/TripApi';
import DatePicker from 'react-native-date-picker';
import axios from 'axios';

interface TripDetailItemProps {
    type: string;
    time: string;
    location: string;
    note?: string;
    status?: string;
    waiting?: boolean;
}

interface Trip {
    id: any;
    activity: string;
    consignee: string;
    timestamp: string;
    quantity: string;
    type: string;
    partyname: string;
    notes: string;
    location: string;
    locations?: string;
}

type AddTripProps = NativeStackScreenProps<RootStackParamList, "AddTrip">;

const WaitingTime: React.FC<AddTripProps> = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatTime24Hour = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Form state
    const [activity, setActivity] = useState<string>('');
    const [consignee, setConsignee] = useState<string>('');
    const [receiverName, setReceiverName] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [startedTrip, setStartedTrip] = useState<any>(null);
    const [AddTripAcvity] = useAddTripAcvityMutation();
    const [OneTripAcvity] = useOneTripAcvityMutation();
    const [tripdetails, setTripdetails] = useState<any>(null);
    const [apikey, setApikey] = useState<string>('');
    const Navigation = useNavigation();
    const [tripAcvitys, setTripAcvitys] = useState<any[]>([]);
    const isFocused = useIsFocused();
    console.log('tripAcvitys', tripAcvitys);
    // Modal states
    const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
    const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const [ToimeOpen, setToTimeOpen] = useState(false);
    const [time, setTime] = useState<Date | null>(null);
    const [ToTime, setToTime] = useState<Date | null>(null);
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showsuggestion, setShowsuggestion] = useState(false);

    // Get current date
    const getCurrentDate = (): string => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        return `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
    };

    const currentDate = getCurrentDate();

    // Fetch API key and trip data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    Navigation.navigate("SignInPage");
                    return;
                }
                setApikey(token);

                const [trips, finishtrip] = await Promise.all([
                    AsyncStorage.getItem('startedTrip'),
                    AsyncStorage.getItem('finishtrip')
                ]);

                if (trips) setStartedTrip(JSON.parse(trips));
                if (finishtrip) setTripdetails(JSON.parse(finishtrip));

            } catch (err) {
                console.error("Initial data loading error:", err);
                setError("Failed to load initial data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [Navigation, isFocused]);

    // Fetch trip activities
    useEffect(() => {
        const fetchTripActivities = async () => {
            if (!apikey || !startedTrip?.TripNumber) return;

            try {
                setIsLoading(true);
                const body = { status: 200, TripNumber: startedTrip.TripNumber };
                const response = await OneTripAcvity({ apikey, body }).unwrap();
                setTripAcvitys(response.data || []);
            } catch (err) {
                console.error("Trip activities loading error:", err);
                setError("Failed to load trip activities");
            } finally {
                setIsLoading(false);
            }
        };

        if (isFocused) {
            fetchTripActivities();
        }
    }, [isFocused, apikey, startedTrip?.TripNumber]);

    // Activity dropdown data
    const { data, isLoading: activityLoading } = useActivityDropDownListQuery({ apikey }, { skip: !apikey });
    const acvityData = data?.data.waitinglist || [];
    const matched = tripdetails?.TripNumber === startedTrip?.TripNumber;

    const handleSearchLocation = async (query: string) => {
        if (!query) {
            setLocationSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=AIzaSyAfW5xjLmNIkot1I438jq0C9cezbx6_uNQ`
            );
            setLocationSuggestions(response?.data?.results || []);
            setShowsuggestion(true);
        } catch (error) {
            console.log(error);
            setLocationSuggestions([]);
        }
    };

    const handleSelectLocation = (suggestion: any) => {
        setConsignee(suggestion.formatted_address);
        setLocationSuggestions([]);
        setShowsuggestion(false);
    };

    const handleAddTrip = async () => {
        if (!time || !ToTime) {
            Alert.alert("Error", "Please select both From and To times");
            return;
        }

        try {
            setIsLoading(true);
            const formatDateTime = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };

            const tripData = {
                status: 200,
                TripNumber: startedTrip?.TripNumber,
                activities: [{
                    activity,
                    location: consignee,
                    timestampfrom: formatDateTime(time),
                    timestampto: formatDateTime(ToTime),
                    partyname: receiverName,
                    notes: note,
                }],
            };

            const response = await AddTripAcvity({ apikey, body: tripData }).unwrap();
            setTripAcvitys(response?.data || []);

            if (response?.data?.code === 'success') {
                Alert.alert("Success", "Waiting Time Added Successfully");
                // Reset form
                setActivity('');
                setConsignee('');
                setReceiverName('');
                setNote('');
                setTime(null);
                setToTime(null);
            }
        } catch (error) {
            console.error("Error adding trip:", error);
            Alert.alert("Error", "Failed to add waiting time");
        } finally {
            setIsLoading(false);
        }
    };

    const finishTrip = () => {
        Navigation.navigate('FinishTrip');
    };

    if (isLoading) {
        return (
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#29adf8" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-white`}>
                <Text style={tw`text-red-500 text-lg mb-4`}>{error}</Text>
                <TouchableOpacity
                    style={tw`bg-blue-500 px-4 py-2 rounded`}
                    onPress={() => Navigation.goBack()}
                >
                    <Text style={tw`text-white`}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!startedTrip) {
        return (
            <SafeAreaView style={tw`flex-1 justify-center items-center bg-white`}>
                <Text style={tw`text-lg mb-4`}>No active trip found</Text>
                <TouchableOpacity
                    style={tw`bg-blue-500 px-4 py-2 rounded`}
                    onPress={() => Navigation.navigate('HomeScreen')}
                >
                    <Text style={tw`text-white`}>Start a Trip</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <StatusBar barStyle="light-content" />
            <Header />

            <ScrollView style={tw`flex-1`}>
                <View style={tw`flex-row justify-between items-center p-4 bg-gray-100 border-b border-gray-300`}>
                    <Text style={tw`text-xl font-bold text-gray-800`}>Waiting Time</Text>
                    <Text style={tw`text-lg font-bold text-gray-700 text-center`}>{currentDate}</Text>
                </View>

                {/* Form Section */}
                <View style={tw`p-4`}>
                    <View style={tw`flex-row items-center mb-4`}>
                        <Text style={tw`w-24 text-base font-medium`}>Activity:</Text>
                        <TouchableOpacity
                            style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5 flex-row items-center justify-between`}
                            onPress={() => setShowActivityModal(true)}
                        >
                            <Text>{activity || acvityData[0]?.item || 'Select'}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={tw`flex-row items-center mb-4 `}>
                        <Text style={tw`w-24 text-base font-medium`}>{activity === 'Pickup' ? 'Shipper:' : 'Location:'}</Text>


                        <View style={tw`flex-1`}>


                            <TextInput
                                style={tw`flex-1 h-11 border border-gray-300 rounded px-2.5`}
                                value={consignee}
                                onChangeText={(text) => {
                                    setConsignee(text);
                                    handleSearchLocation(text);
                                }}
                                placeholder={`${activity === 'Pickup' ? 'Waiting Shipper Location' : 'Waiting Location'}`}
                            />

                            {locationSuggestions.length > 0 && showsuggestion && (
                                <View style={tw`absolute top-[44px] left-0 right-0 bg-white border border-gray-300 rounded z-10 mt-1`}>
                                    {locationSuggestions.map((suggestion, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleSelectLocation(suggestion)}
                                            style={tw`p-2 border-b border-gray-300`}
                                        >
                                            <Text>{suggestion.formatted_address}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={tw`flex-row items-center mb-4`}>
                        <Text style={tw`w-24 text-base font-medium`}>Time :</Text>
                        <View style={tw`flex-1 flex flex-row items-center gap-2`}>
                            <View style={tw`flex-1 border border-gray-300 rounded max-w-[70%]`}>
                                <TouchableOpacity onPress={() => setOpen(true)} style={tw`h-[42px] justify-center`}>
                                    <Text style={tw`text-gray-700 text-[15px] px-2 pl-3`}>
                                        {time ? formatTime24Hour(time) : 'From'}
                                    </Text>
                                </TouchableOpacity>
                                <DatePicker
                                    modal
                                    mode="time"
                                    open={open}
                                    date={time || new Date()}
                                    onConfirm={(selectedTime) => {
                                        setOpen(false);
                                        setTime(selectedTime);
                                    }}
                                    onCancel={() => setOpen(false)}
                                    is24hourSource="locale"
                                    locale="en_GB"
                                />
                            </View>

                            <View style={tw`flex-1 border border-gray-300 rounded max-w-[70%]`}>
                                <TouchableOpacity onPress={() => setToTimeOpen(true)} style={tw`h-[42px] justify-center`}>
                                    <Text style={tw`text-gray-700 text-[15px] px-2 pl-3`}>
                                        {ToTime ? formatTime24Hour(ToTime) : 'To'}
                                    </Text>
                                </TouchableOpacity>
                                <DatePicker
                                    modal
                                    mode="time"
                                    open={ToimeOpen}
                                    date={ToTime || new Date()}
                                    onConfirm={(selectedTime) => {
                                        setToTimeOpen(false);
                                        setToTime(selectedTime);
                                    }}
                                    onCancel={() => setToTimeOpen(false)}
                                    is24hourSource="locale"
                                    locale="en_GB"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={tw`flex flex-row items-center gap-2 justify-end`}>
                        <View style={tw`flex-1 max-w-[10%] pb-4`}>
                            <TouchableOpacity
                                style={tw`w-[33px] h-8 rounded-full bg-green-500 items-center justify-center`}
                                onPress={() => setShowAddNoteModal(true)}
                            >
                                <AntDesign name="plus" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={tw`h-11 w-full max-w-[75%] border border-gray-300 rounded px-2.5 mb-4 text-center`}
                            placeholder="Party Name"
                            value={receiverName}
                            onChangeText={setReceiverName}
                            placeholderTextColor="#000"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={tw`mx-2 mb-4 flex-1 max-w-[100%] ${matched ? 'bg-gray-400' : 'bg-[#29adf8]'} py-2 rounded-sm`}
                    onPress={handleAddTrip}
                    disabled={isLoading}
                >
                    <Text style={tw`text-white text-lg text-center font-bold`}>
                        {isLoading ? 'Adding...' : 'Add Waiting Time'}
                    </Text>
                </TouchableOpacity>

                {/* Trip Details Section */}
                <View style={tw`bg-white`}>
                    <TouchableOpacity
                        disabled={matched}
                        style={tw`mb-4 flex-1 max-w-[100%] bg-gray-100 border-b border-gray-300 py-2 rounded-sm`}
                    >
                        <Text style={tw`text-lg pl-4 text-gray-700 font-bold`}>Today's Trip Details</Text>
                    </TouchableOpacity>

                    <View style={tw`px-4`}>
                        <View style={tw`h-[100%] absolute right-2 border border-dashed border-gray-400 w-[2px] mr-2`} />
                        <View style={tw`flex-row items-center absolute -right-1 pr-2 -top-0`}>
                            <FontAwesome
                                name="circle"
                                style={tw`border border-gray-300 py-1 px-[5px] rounded-full text-green-500`}
                                size={18}
                            />
                        </View>
                        <Text style={tw`text-base font-semibold`}>Start</Text>
                        <Text style={tw`text-xs text-gray-500`}>Start Time: {startedTrip?.start?.timestamp}</Text>
                        <Text style={tw`text-xs text-gray-500`}>End Time: {startedTrip?.start?.maxactivitytimelimit}</Text>
                        <Text style={tw`text-sm text-gray-600`}>Location: {startedTrip?.start?.location}</Text>
                    </View>

                    {/* {tripAcvitys?.activities?.map((item, index) => (
                        <View key={index} style={tw`px-4`}>
                            <View style={tw`h-[100%] absolute right-2 border border-dashed border-gray-400 mr-2`} />
                            <View style={tw`flex-row items-center absolute -right-1 pr-2 top-3`}>
                                <FontAwesome
                                    name="circle"
                                    style={tw`border border-gray-300 py-1 px-[5px] rounded-full ${item.activity === "Pickup" ? "text-[#29adf8]" : "text-yellow-500"}`}
                                    size={18}
                                />
                            </View>
                            <Text style={tw`text-base font-semibold mt-4`}>{item.activity}</Text>

                            {
                                item.timestampfrom && item.timestampto ? (
                                    <Text style={tw`text-sm text-gray-600`}> { new Date(item?.timestampfrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }
                                    -
                                        { new Date(item?.timestampto).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </Text>
                                ):<Text style={tw`text-sm text-gray-600`}> { new Date(item?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }
                                </Text>
                            }
                          
                            <Text style={tw`text-sm text-gray-600`}>Location: {item.location}</Text>

                            {item.notes && (
                                <Text style={tw`text-sm text-gray-500 italic`}>Notes: {item.notes}</Text>
                            )}
                        </View>
                    ))} */}
                    {
                        tripAcvitys?.activities?.map((item, index) => {
                            // const formattedTime = item.timestamp && format(new Date(item.timestamp), "dd MMM yyyy, hh:mm a")
                            return (

                                <View key={index} style={tw`px-4`}>
                                    <View style={tw`h-[100%] absolute right-2  border border-dashed border-gray-400  mr-2`} />

                                    <View style={tw`flex-row items-center absolute -right-1 pr-2 top-3`}>
                                        <FontAwesome
                                            name="circle"
                                            style={tw`border border-gray-300 py-1 px-[5px] rounded-full 
                                                ${item.activity?.includes("Waiting") ? "text-orange-500" : "text-[#29adf8]"}`}
                                              
                                            size={18}
                                        // color={item.activity === "Pickup" ? "blue" : "green"}
                                        />
                                    </View>

                                    {/* Activity Name */}
                                    <Text style={tw`text-base font-semibold mt-4`}>{item.activity}</Text>

                                    {/* Formatted Timestamp */}
                                    {
                                        item.timestampfrom && item.timestampto ? (
                                            <Text style={tw`text-sm text-gray-600 `}>{new Date(item?.timestampfrom).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(item?.timestampto).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </Text>
                                        ) :<Text style={tw`text-xs text-gray-500`}>{item.timestamp}</Text>
                                    }

                                    {/* Other Details */}
                                    <Text style={tw`text-sm text-gray-600`}>Location: {item.location}</Text>
                                    {
                                        item.qty &&    <Text style={tw`text-sm text-gray-600`}>Quantity: {item.qty} {item.Type}</Text>
                                    }
                                  

                                    {item.notes && (
                                        <Text style={tw`text-sm text-gray-500 italic`}>Notes: {item.notes}</Text>
                                    )}
                                </View>
                            )
                        }
                        )
                    }

                    {matched && (
                        <View style={tw`px-4`}>
                            <View style={tw`h-[100%] absolute right-2 mr-2`} />
                            <View style={tw`flex-row items-center absolute -right-1 pr-2 top-0`}>
                                <FontAwesome
                                    name="circle"
                                    style={tw`border border-gray-300 py-1 px-[5px] rounded-full`}
                                    size={18}
                                    color={"red"}
                                />
                            </View>
                            <Text style={tw`text-base font-semibold text-[#ff0000] mt-2`}>Finish</Text>
                            <Text style={tw`text-xs text-gray-500`}>finish time: {tripdetails?.finish?.timestamp}</Text>
                            <Text style={tw`text-sm text-gray-600`}>Location: {tripdetails?.finish?.location}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        disabled={matched}
                        style={tw`mx-2 mb-4 mt-20 py-2 rounded-sm ${matched ? "bg-gray-400" : "bg-red-500"}`}
                        onPress={finishTrip}
                    >
                        <Text style={tw`text-white text-lg text-center font-bold`}>Finish Trip</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Activity Selection Modal */}
            <Modal visible={showActivityModal} transparent={true} animationType="slide">
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-lg w-80 p-4`}>
                        {acvityData?.map((data) => (
                            <TouchableOpacity
                                key={data.item}
                                style={tw`py-3 border-b border-gray-200`}
                                onPress={() => {
                                    setActivity(data.item);
                                    setShowActivityModal(false);
                                }}
                            >
                                <Text style={tw`text-center ${activity === data.item ? 'font-bold text-blue-500' : ''}`}>
                                    {data.item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={tw`mt-4 bg-gray-200 py-2 rounded-lg`}
                            onPress={() => setShowActivityModal(false)}
                        >
                            <Text style={tw`text-center`}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Note Modal */}
            <Modal visible={showAddNoteModal} transparent={true} animationType="slide">
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-lg w-80 p-4`}>
                        <Text style={tw`text-lg font-bold mb-4 text-center`}>Add Note</Text>
                        <View style={tw`mb-4`}>
                            <Text style={tw`text-sm font-medium mb-2`}>Short Note:</Text>
                            <TextInput
                                style={tw`border border-gray-300 rounded p-2 h-20`}
                                value={note}
                                onChangeText={setNote}
                                placeholder="Enter a short note about this location..."
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        <TouchableOpacity
                            style={tw`bg-gray-200 py-2 rounded-lg`}
                            onPress={() => setShowAddNoteModal(false)}
                        >
                            <Text style={tw`text-center`}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default WaitingTime;