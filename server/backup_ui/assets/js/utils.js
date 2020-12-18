function postData(url = '', data = {}) {
	return fetch(url, {
		method: 'POST', // type of request we are making
		mode: 'cors', // Cross-Origin Resource Sharing e.g. Cross-Platform Compatability
		cache: 'no-cache',
		credentials: 'include', // needed to pass cookies in request
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow',
		referrer: 'no-referer',
		body: JSON.stringify(data), // pass body of POST
	}).then((response) => response.json());
}

function signIn() {
	const body = {
		email: document.forms[0].elements[0].value,
		password: document.forms[0].elements[1].value,
	};

	postData('/login', body)
		.then((response) => {
			if (response.status !== 200) throw new Error(response.error);
			window.location.replace('/game.html');
		})
		.catch((error) => {
			window.alert(error.message);
			window.location.replace('/index.html');
		});
}

function signUp() {
	const body = {
		email: document.forms[0].elements[0].value,
		password: document.forms[0].elements[1].value,
		username: document.forms[0].elements[2].value,
	};
	postData('/signup', body)
		.then((response) => {
			if (response.status !== 200) throw new Error(response.error);
			window.alert('user created successfully');
			window.location.replace('/index.html');
		})
		.catch((error) => {
			window.alert(error.message);
			window.location.replace('/signup.html');
		});
}

function forgotPassword() {
	const body = {
		email: document.forms[0].elements[0].value,
	};
	postData('/forgot-password', body)
		.then((response) => {
			if (response.status !== 200) throw new Error(response.error);
			window.alert('password reset email sent');
			window.location.replace('/index.html');
		})
		.catch((error) => {
			window.alert(error.message);
			window.location.replace('/forgot-password.html');
		});
}

function resetPassword() {
	const password = document.forms[0].elements[1].value;
	const verifiedPassword = document.forms[0].elements[2].value;

	const body = {
		password,
		verifiedPassword,
		email: document.forms[0].elements[0].value,
		token: document.location.href.split('token=')[1],
	};
	if (password !== verifiedPassword) {
		window.alert('passwords do not match');
	} else {
		postData('/reset-password', body)
			.then((response) => {
				if (response.status !== 200) throw new Error(response.error);
				window.alert('password updated');
				window.location.replace('/index.html');
			})
			.catch((error) => {
				window.alert(error.message);
				window.location.replace('/reset-password.html');
			});
	}
}

function logout() {
	const body = {
		refreshToken: document.forms[0].elements[0].value,
	};

	postData('/logout', body)
		.then((response) => {
			if (response.status !== 200) throw new Error(response.error);
			window.alert('Logged Out Successful');
			window.location.replace('/index.html');
		})
		.catch((error) => {
			window.alert(error.message);
			window.location.replace('/index.html');
		});
}
