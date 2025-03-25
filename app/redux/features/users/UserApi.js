import { api } from "../../baseApi"; 

const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => ({
        url: "/register.php",
        method: "POST",
        body: {
          name: user.name,
          email: user.email,
          password: user.password,
        }, // Sending only necessary data to the API
      }),
      invalidatesTags: ["user"],
    }),

    loginUser: builder.mutation({
        query: ({ email, password }) => ({
          url: `/?email=${email}&password=${password}`, // Send email and password as query params
          method: "POST",
        }),
        invalidatesTags: ["user"],
      }),

      authuser: builder.mutation({
        query: ({ apikey }) => ({
          url: `/validate_user.php?apikey=${apikey}`,
          method: 'POST',  
        }),
      }),

      upatePassword : builder.mutation({
        query: ({ apikey, ...body }) => ({
          url: `/update_password.php?apikey=${apikey}`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["user"],
      }),
      

    
      
  }),
});

export const { useRegisterUserMutation, useLoginUserMutation, useAuthuserMutation, useUpatePasswordMutation } = userApi;
export default userApi; 
