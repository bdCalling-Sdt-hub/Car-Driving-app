import React from 'react';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';

const ActivityPicker = ({ selectedActivity, setSelectedActivity, data }) => (
  <Picker
    selectedValue={selectedActivity}
    onValueChange={(value) => setSelectedActivity(value)}
    style={tw`font-bold text-lg border border-gray-300 rounded mb-3 w-[73%]`}
  >
    {data?.activitylist?.map((activity) => (
      <Picker.Item key={activity.id} label={activity.name} value={activity.id} />
    ))}
  </Picker>
);

export default ActivityPicker;