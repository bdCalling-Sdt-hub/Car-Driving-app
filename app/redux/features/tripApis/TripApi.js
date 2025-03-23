import { api } from "../../baseApi";

const TripApi = api.injectEndpoints({
  endpoints: (builder) => ({
    activityDropDownList: builder.query({
      query: ({ apikey }) => ({
        url: `/tripactivitydropdown.php?apikey=${apikey}`,
        method: "GET",
      }),
    }),
    TypeDropDownList: builder.query({
      query: ({ apikey }) => ({
        url: `/loadtypesdropdown.php?apikey=${apikey}`,
        method: "GET",
      }),
    }),






   Trucksandtailors: builder.query({
      query: ({ apikey }) => ({
        url: `/equipmentlist.php?apikey=${apikey}`,
        method: "GET",
      }),
    }),

    startNewTrip: builder.mutation({
      query: ({ apikey, ...body }) => ({
        url: `/trip.php?apikey=${apikey}`,  // ✅ Pass API key in the URL
        method: "POST",
        body,  // ✅ Send the rest of the trip data as the body
      }),
    }),
    
    

    AddTripAcvity: builder.mutation({
      query: ({apikey,body}) => ({
        url: `/trip.php?apikey=${apikey}`,
        method: "POST",
        body,
      }),
    }),

    FinishTrip : builder.mutation({
      query: (body) => ({
        url: `/trip.php?apikey=${apikey}`,
        method: "POST",
        body,
      }),
    }),








    HeaderLogo : builder.query({
      query: ({ apikey }) => ({
        url: `/headerlogo.php?apikey=${apikey}`,
        method: "GET",
      }),
    }),




  }),
});

export const { useActivityDropDownListQuery, useTrucksandtailorsQuery, useStartNewTripMutation, useAddTripAcvityMutation, useFinishTripMutation, useHeaderLogoQuery ,useTypeDropDownListQuery } = TripApi;
export default TripApi;
