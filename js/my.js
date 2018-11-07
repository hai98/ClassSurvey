$(document).ready(function() {
   $("#loginForm").submit(function(e) {
      e.preventDefault();
      if ($("#userName").val() != '' && $("#Password").val() != '') {
           if ($("#userName").val() == 'admin' && $("#Password").val() == 'admin') {
              window.location.href = './admin.html'; 
           } else {
               alert('invalid username password');
           }
      } else {
        alert('username or password cann\'t be blank');  
      }
   });
});