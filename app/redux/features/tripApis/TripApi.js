import { api } from "../../baseApi";

const TripApi = api.injectEndpoints({
  endpoints: (builder) => ({
    activityDropDownList: builder.query({
      query: ({ apikey }) => ({
        url: `/tripactivitydropdown.php?apikey=${apikey}`,
        method: "GET",
      }),
      providesTags: ["trip"],
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
        url: `/trip.php?apikey=${apikey}`,  
        method: "POST",
        body, 
      }),
      providesTags: ["trip"],
    }),

    OneTripAcvity: builder.mutation({
      query: ({apikey,body}) => ({
        url: `/trip.php?apikey=${apikey}`,
        method: "POST",
        body,
      }),
      providesTags: ["trip"],
    }),

    AddTripAcvity: builder.mutation({
      query: ({apikey,body}) => ({
        url: `/trip.php?apikey=${apikey}`,
        method: "POST",
        body,
      }),
      providesTags: ["trip"],
    }),

    
    FinishTrip: builder.mutation({
      query: ({ apikey, ...body }) => ({
        url: `/trip.php?apikey=${apikey}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["trip"],
    }),
    





    HeaderLogo : builder.query({
      query: ({ apikey }) => ({
        
        url: `/headerlogo.php?apikey=${apikey}`,
        method: "GET",
      }),
    }),




  }),
});

export const { useActivityDropDownListQuery, useTrucksandtailorsQuery, useStartNewTripMutation, useAddTripAcvityMutation, useFinishTripMutation, useHeaderLogoQuery ,useTypeDropDownListQuery, useOneTripAcvityMutation } = TripApi;
export default TripApi;
