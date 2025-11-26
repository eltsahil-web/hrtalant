import streamlit as st
import google.generativeai as genai

# 1. CONFIGURE THE PAGE
st.set_page_config(page_title="Obserview", page_icon="🏫")
st.title("Obserview: AI Lesson Observation")
st.write("Welcome! Describe the lesson or paste your observation notes below.")

# 2. SETUP THE API KEY
# We will set this up in the Streamlit settings in the next step
# If you are testing locally, you can hardcode it here, but for public deployment, use secrets.
# validation: check if key exists
if "GOOGLE_API_KEY" in st.secrets:
    genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])
else:
    st.error("Missing API Key. Please add it to Streamlit Secrets.")
    st.stop()

# 3. SETUP THE MODEL
# This matches the model you used in AI Studio
model = genai.GenerativeModel('gemini-1.5-flash')

# 4. CHAT INTERFACE
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display previous chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("Enter your observation details here..."):
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Generate response
    with st.chat_message("assistant"):
        with st.spinner("Analyzing lesson data..."):
            try:
                response = model.generate_content(prompt)
                st.markdown(response.text)
                st.session_state.messages.append({"role": "assistant", "content": response.text})
            except Exception as e:
                st.error(f"An error occurred: {e}")
