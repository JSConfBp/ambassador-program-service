module.exports = function (data) {
	return `*Welcome to our Ambassador Program ${data.community}!*

_mailto: ${data.email}_

Hi ${data.name},

thank you for applying to our Ambassador Program for 2019!

To help developer communities, we start our Ambassador Program! We provide a 10% discount coupon code for every community, who applies for the program.

For every 5 ticket sold with this coupon code, we provide a free ticket for the community who applied for the coupon, this free ticket then can be awarded to a community/meetup/usergroup member, or make it as a prize in a contest, it’s up to the awarded group.

Your coupon code is: ${data.code}

You can instantly see the updated prices using this link to the ticket page:

https://ti.to/jsconf-bp/jsconf-budapest-2019/discount/${data.code}

We’ve teamed up with CSSConf Budapest, so the discount can be used with Regular Combo (JS+CSS) tickets too!

Thank you, and we hope we’ll meet in September!

The organizers of JSConf Budapest 2019

team@jsconfbp.com
`
}