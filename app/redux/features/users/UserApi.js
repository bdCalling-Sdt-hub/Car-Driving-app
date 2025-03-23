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

    authenticateUser: builder.query({
      query: ({ apikey}) => ({
        url: `/validate_user.php?apikey=${apikey}`,
        method: "GET",
      }),
    }),
      
  }),
});

export const { useRegisterUserMutation, useLoginUserMutation, useAuthenticateUserQuery } = userApi;
export default userApi; // ✅ Add default export
