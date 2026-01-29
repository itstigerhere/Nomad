package com.tripfactory.nomad;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestMailConfig.class)
class NomadApplicationTests {

	@Test
	void contextLoads() {
	}

}
